import {getUniResolver} from '@sphereon/did-uni-client';
import {JwkDIDProvider} from '@sphereon/ssi-sdk-ext.did-provider-jwk';
import {getDidJwkResolver} from '@sphereon/ssi-sdk-ext.did-resolver-jwk';
import {SphereonKeyManager} from '@sphereon/ssi-sdk-ext.key-manager';
import {SphereonKeyManagementSystem} from '@sphereon/ssi-sdk-ext.kms-local';
import {ContactManager} from '@sphereon/ssi-sdk.contact-manager';
import {ContactStore, EventLoggerStore, IssuanceBrandingStore} from '@sphereon/ssi-sdk.data-store';
import {IssuanceBranding} from '@sphereon/ssi-sdk.issuance-branding';
import {LoggingEventType} from '@sphereon/ssi-sdk.core';
import {DidAuthSiopOpAuthenticator} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {
  CredentialHandlerLDLocal,
  MethodNames,
  SphereonEd25519Signature2018,
  SphereonEd25519Signature2020,
  SphereonJsonWebSignature2020,
} from '@sphereon/ssi-sdk.vc-handler-ld-local';
import {createAgent, IAgentPlugin, TAgent} from '@veramo/core';
import {CredentialPlugin} from '@veramo/credential-w3c';
import {DataStore, DataStoreORM, DIDStore, KeyStore, PrivateKeyStore} from '@veramo/data-store';
import {DIDManager, AbstractIdentifierProvider} from '@veramo/did-manager';
import {EthrDIDProvider} from '@veramo/did-provider-ethr';
import {getDidIonResolver, IonDIDProvider} from '@veramo/did-provider-ion';
import {getDidKeyResolver, KeyDIDProvider} from '@veramo/did-provider-key';
import {DIDResolverPlugin} from '@veramo/did-resolver';
import {SecretBox} from '@veramo/kms-local';
import {OrPromise} from '@veramo/utils';
import {Resolver} from 'did-resolver';
import {DataSource} from 'typeorm';
import {getResolver as webDIDResolver} from 'web-did-resolver';
import {EventLogger} from '@sphereon/ssi-sdk.event-logger';
import {DID_PREFIX, DIF_UNIRESOLVER_RESOLVE_URL} from '../@config/constants';
import {LdContexts} from '../@config/credentials';
import {DB_CONNECTION_NAME, DB_ENCRYPTION_KEY} from '../@config/database';
import {getDbConnection} from '../services/databaseService';
import {AgentTypes, KeyManagementSystemEnum, SupportedDidMethodEnum} from '../types';

export const didResolver: Resolver = new Resolver({
  ...getUniResolver(SupportedDidMethodEnum.DID_ETHR, {
    resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL,
  }),
  ...getDidKeyResolver(),
  ...webDIDResolver(),
  ...getDidIonResolver(),
  ...getDidJwkResolver(),
});

export const didMethodsSupported: Array<string> = Object.keys(didResolver['registry']).map((method: string) =>
  method.toLowerCase().replace('did:', ''),
);

export const didProviders: Record<string, AbstractIdentifierProvider> = {
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ETHR}`]: new EthrDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
    network: 'goerli',
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_KEY}`]: new KeyDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ION}`]: new IonDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_JWK}`]: new JwkDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
  }),
};

const dbConnection: OrPromise<DataSource> = getDbConnection(DB_CONNECTION_NAME);
const privateKeyStore: PrivateKeyStore = new PrivateKeyStore(dbConnection, new SecretBox(DB_ENCRYPTION_KEY));

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
    defaultProvider: `${DID_PREFIX}:${SupportedDidMethodEnum.DID_KEY}`,
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
  new EventLogger({
    eventTypes: [LoggingEventType.AUDIT],
    store: new EventLoggerStore(dbConnection),
  }),
];

const agent: TAgent<AgentTypes> = createAgent<AgentTypes>({
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
export const dataStoreORMGetVerifiableCredentials = agent.dataStoreORMGetVerifiableCredentials;
export const dataStoreSaveVerifiableCredential = agent.dataStoreSaveVerifiableCredential;
export const keyManagerSign = agent.keyManagerSign;
export const dataStoreGetVerifiableCredential = agent.dataStoreGetVerifiableCredential;
export const dataStoreDeleteVerifiableCredential = agent.dataStoreDeleteVerifiableCredential;
export const createVerifiableCredential = agent.createVerifiableCredential;
export const ibAddCredentialBranding = agent.ibAddCredentialBranding;
export const ibGetCredentialBranding = agent.ibGetCredentialBranding;
export const ibCredentialLocaleBrandingFrom = agent.ibCredentialLocaleBrandingFrom;
export const ibRemoveCredentialBranding = agent.ibRemoveCredentialBranding;

export default agent;

export const agentContext = {...agent.context, agent};
