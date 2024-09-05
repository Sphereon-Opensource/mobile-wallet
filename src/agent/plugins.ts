import {SphereonKeyManager} from '@sphereon/ssi-sdk-ext.key-manager';
import {SphereonKeyManagementSystem} from '@sphereon/ssi-sdk-ext.kms-local';
import {ContactManager} from '@sphereon/ssi-sdk.contact-manager';
import {LinkHandlerEventType, LinkHandlerPlugin} from '@sphereon/ssi-sdk.core';
import {CredentialStore} from '@sphereon/ssi-sdk.credential-store';
import {ContactStore, DigitalCredentialStore, IssuanceBrandingStore, MachineStateStore} from '@sphereon/ssi-sdk.data-store';
import {IssuanceBranding} from '@sphereon/ssi-sdk.issuance-branding';
import {OID4VCIHolder, OnContactIdentityCreatedArgs, OnCredentialStoredArgs, OnIdentifierCreatedArgs} from '@sphereon/ssi-sdk.oid4vci-holder';
import {SDJwtPlugin} from '@sphereon/ssi-sdk.sd-jwt';
import {DidAuthSiopOpAuthenticator} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {
  CredentialHandlerLDLocal,
  MethodNames,
  SphereonEd25519Signature2018,
  SphereonEd25519Signature2020,
  SphereonJsonWebSignature2020,
} from '@sphereon/ssi-sdk.vc-handler-ld-local';
import {MachineStatePersistence, MachineStatePersistEventType} from '@sphereon/ssi-sdk.xstate-machine-persistence';
import {IAgentPlugin} from '@veramo/core';
import {CredentialPlugin} from '@veramo/credential-w3c';
import {DataStore, DataStoreORM, DIDStore, KeyStore, PrivateKeyStore} from '@veramo/data-store';
import {DIDManager} from '@veramo/did-manager';
import {DIDResolverPlugin} from '@veramo/did-resolver';
import {LdContexts} from '../@config/credentials';
import {dispatchIdentifier} from '../services/identityService';
import {verifySDJWTSignature} from '../services/signatureService';
import store from '../store';
import {dispatchVerifiableCredential} from '../store/actions/credential.actions';
import {DEFAULT_DID_PREFIX_AND_METHOD} from '../types';
import {ADD_IDENTITY_SUCCESS} from '../types/store/contact.action.types';
import {generateDigest, generateSalt} from '../utils';
import {didProviders, didResolver, linkHandlers} from './index';
import {OrPromise} from '@sphereon/ssi-types';
import {DataSource} from 'typeorm';

export const oid4vciHolder = new OID4VCIHolder({
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
  hasher: generateDigest,
});

export const createAgentPlugins = ({
  privateKeyStore,
  dbConnection,
}: {
  privateKeyStore: PrivateKeyStore;
  dbConnection: OrPromise<DataSource>;
}): Array<IAgentPlugin> => {
  return [
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
      defaultProvider: DEFAULT_DID_PREFIX_AND_METHOD,
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
    oid4vciHolder,
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
};
