import {getUniResolver} from '@sphereon/did-uni-client';
import {JwkDIDProvider} from '@sphereon/ssi-sdk-ext.did-provider-jwk';
import {getDidKeyResolver, SphereonKeyDidProvider} from '@sphereon/ssi-sdk-ext.did-provider-key';
import {getResolver as getDidEbsiResolver} from '@sphereon/ssi-sdk-ext.did-resolver-ebsi';
import {getDidJwkResolver} from '@sphereon/ssi-sdk-ext.did-resolver-jwk';
import {SphereonKeyManager} from '@sphereon/ssi-sdk-ext.key-manager';
import {SphereonKeyManagementSystem} from '@sphereon/ssi-sdk-ext.kms-local';
import {ContactManager} from '@sphereon/ssi-sdk.contact-manager';
import {LinkHandlerEventType, LinkHandlerPlugin, LinkHandlers, LogLinkHandler} from '@sphereon/ssi-sdk.core';
import {OnIdentifierCreatedArgs} from '@sphereon/ssi-sdk.oid4vci-holder/src/types/IOID4VCIHolder';
import {ContactStore, DigitalCredentialStore, IssuanceBrandingStore, MachineStateStore} from '@sphereon/ssi-sdk.data-store';
import {IssuanceBranding} from '@sphereon/ssi-sdk.issuance-branding';
import {OID4VCIHolder, OnContactIdentityCreatedArgs, OnCredentialStoredArgs} from '@sphereon/ssi-sdk.oid4vci-holder';
import {DidAuthSiopOpAuthenticator} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {getDidOydResolver, OydDIDProvider} from '@sphereon/did-provider-oyd';
import {
  CredentialHandlerLDLocal,
  MethodNames,
  SphereonEd25519Signature2018,
  SphereonEd25519Signature2020,
  SphereonJsonWebSignature2020,
} from '@sphereon/ssi-sdk.vc-handler-ld-local';
import {MachineStatePersistence, MachineStatePersistEventType} from '@sphereon/ssi-sdk.xstate-machine-persistence';
import {SDJwtPlugin} from '@sphereon/ssi-sdk.sd-jwt';
import {createAgent, IAgentPlugin} from '@veramo/core';
import {CredentialPlugin} from '@veramo/credential-w3c';
import {DataStore, DataStoreORM, DIDStore, KeyStore, PrivateKeyStore} from '@veramo/data-store';
import {DIDManager} from '@veramo/did-manager';
import {EthrDIDProvider} from '@veramo/did-provider-ethr';
import {getDidIonResolver, IonDIDProvider} from '@veramo/did-provider-ion';
import {DIDResolverPlugin} from '@veramo/did-resolver';
import {SecretBox} from '@veramo/kms-local';
import {OrPromise} from '@veramo/utils';
import {Resolver} from 'did-resolver';
import {DataSource} from 'typeorm';
import {getResolver as webDIDResolver} from 'web-did-resolver';
import {DID_PREFIX, DIF_UNIRESOLVER_RESOLVE_URL} from '../@config/constants';
import {LdContexts} from '../@config/credentials';
import {DB_CONNECTION_NAME, DB_ENCRYPTION_KEY} from '../@config/database';
import {addLinkListeners} from '../handlers/LinkHandlers';
import {getDbConnection} from '../services/databaseService';
import {dispatchIdentifier} from '../services/identityService';
import {verifySDJWTSignature} from '../services/signatureService';
import store from '../store';
import {dispatchVerifiableCredential} from '../store/actions/credential.actions';
import {generateSalt, generateDigest} from '../utils';
import {ADD_IDENTITY_SUCCESS} from '../types/store/contact.action.types';
import {KeyManagementSystemEnum, SupportedDidMethodEnum, TAgentTypes} from '../types';
import {CredentialStore} from '@sphereon/ssi-sdk.credential-store';

export const didResolver = new Resolver({
  ...getUniResolver(SupportedDidMethodEnum.DID_ETHR, {
    resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL,
  }),
  ...getDidEbsiResolver(),
  ...getDidKeyResolver(),
  ...webDIDResolver(),
  ...getDidIonResolver(),
  ...getDidJwkResolver(),
  ...getDidOydResolver(),
});

export const didMethodsSupported = Object.keys(didResolver['registry']).map(method => method.toLowerCase().replace('did:', ''));

export const didProviders = {
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ETHR}`]: new EthrDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
    network: 'goerli',
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_KEY}`]: new SphereonKeyDidProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ION}`]: new IonDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_JWK}`]: new JwkDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_OYD}`]: new OydDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
  }),
};

const dbConnection: OrPromise<DataSource> = getDbConnection(DB_CONNECTION_NAME) as OrPromise<DataSource>;
const privateKeyStore: PrivateKeyStore = new PrivateKeyStore(dbConnection, new SecretBox(DB_ENCRYPTION_KEY));

export const linkHandlers: LinkHandlers = new LinkHandlers().add(new LogLinkHandler());

const agentPlugins: Array<IAgentPlugin> = [
  new DataStore(dbConnection),
  new DataStoreORM(dbConnection),
  new SphereonKeyManager({
    store: new KeyStore(dbConnection),
    kms: {
      local: new SphereonKeyManagementSystem(privateKeyStore),
    },
  }),
  new DIDManager({
    store: new DIDStore(dbConnection),
    defaultProvider: `${DID_PREFIX}:${SupportedDidMethodEnum.DID_JWK}`,
    providers: didProviders,
  }),
  new DIDResolverPlugin({
    resolver: didResolver,
  }),
  new DidAuthSiopOpAuthenticator(),
  new ContactManager({
    store: new ContactStore(dbConnection),
  }),
  new IssuanceBranding({
    store: new IssuanceBrandingStore(dbConnection),
  }),
  new CredentialPlugin(),
  new CredentialHandlerLDLocal({
    contextMaps: [LdContexts],
    suites: [
      new SphereonEd25519Signature2018(),
      new SphereonEd25519Signature2020(),
      // new SphereonBbsBlsSignature2020(),
      new SphereonJsonWebSignature2020(),
    ],
    bindingOverrides: new Map([
      ['verifyCredentialLD', MethodNames.verifyCredentialLDLocal],
      ['verifyPresentationLD', MethodNames.verifyPresentationLDLocal],
      ['createVerifiableCredentialLD', MethodNames.createVerifiableCredentialLDLocal],
      ['createVerifiablePresentationLD', MethodNames.createVerifiablePresentationLDLocal],
    ]),
    keyStore: privateKeyStore,
  }),
  new CredentialStore({store: new DigitalCredentialStore(dbConnection)}),
  new OID4VCIHolder({
    onContactIdentityCreated: async (args: OnContactIdentityCreatedArgs): Promise<void> => {
      store.dispatch({type: ADD_IDENTITY_SUCCESS, payload: args});
    },
    onCredentialStored: async (args: OnCredentialStoredArgs): Promise<void> => {
      const {credential, vcHash} = args;
      store.dispatch<any>(dispatchVerifiableCredential(vcHash, credential));
    },
    onIdentifierCreated: async (args: OnIdentifierCreatedArgs): Promise<void> => {
      const {identifier} = args;
      await dispatchIdentifier({identifier});
    },
  }),
  new MachineStatePersistence({
    store: new MachineStateStore(dbConnection),
    eventTypes: [MachineStatePersistEventType.EVERY],
  }),
  new LinkHandlerPlugin({
    eventTypes: [LinkHandlerEventType.LINK_HANDLER_URL],
    handlers: linkHandlers,
  }),
  new SDJwtPlugin({
    hasher: generateDigest,
    saltGenerator: generateSalt,
    verifySignature: verifySDJWTSignature,
  }),
];

const agent = createAgent<TAgentTypes>({
  plugins: agentPlugins,
});

export const didManagerCreate = agent.didManagerCreate;
export const didManagerFind = agent.didManagerFind;
export const cmGetContacts = agent.cmGetContacts;
export const cmAddContact = agent.cmAddContact;
export const cmUpdateContact = agent.cmUpdateContact;
export const cmRemoveContact = agent.cmRemoveContact;
export const cmAddIdentity = agent.cmAddIdentity;
export const didManagerGet = agent.didManagerGet;
export const keyManagerSign = agent.keyManagerSign;
export const credentialStoreGetVerifiableCredentials = agent.crsGetUniqueCredentials;
export const credentialStoreGetVerifiableCredentialByIdOrHash = agent.crsGetUniqueCredentialByIdOrHash;
export const credentialStoreAddCredential = agent.crsAddCredential;
export const credentialStoreDeleteVerifiableCredential = agent.crsDeleteCredential;
export const createVerifiableCredential = agent.createVerifiableCredential;
export const ibAddCredentialBranding = agent.ibAddCredentialBranding;
export const ibGetCredentialBranding = agent.ibGetCredentialBranding;
export const ibGetIssuerBranding = agent.ibGetIssuerBranding;
export const ibCredentialLocaleBrandingFrom = agent.ibCredentialLocaleBrandingFrom;
export const ibRemoveCredentialBranding = agent.ibRemoveCredentialBranding;

export default agent;

export const agentContext = {...agent.context, agent};
addLinkListeners(linkHandlers, agentContext);
