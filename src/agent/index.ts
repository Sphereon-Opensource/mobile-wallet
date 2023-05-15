import {getUniResolver} from '@sphereon/did-uni-client';
import {ContactManager, IContactManager} from '@sphereon/ssi-sdk-contact-manager';
import {ContactStore} from '@sphereon/ssi-sdk-data-store';
import {DidAuthSiopOpAuthenticator, IDidAuthSiopOpAuthenticator} from '@sphereon/ssi-sdk-did-auth-siop-authenticator';
import {getDidJwkResolver, JwkDIDProvider} from '@sphereon/ssi-sdk-jwk-did-provider';
import {IDidConnectionMode, LtoDidProvider} from '@sphereon/ssi-sdk-lto-did-provider';
import {
  CredentialHandlerLDLocal,
  ICredentialHandlerLDLocal,
  MethodNames,
  SphereonEd25519Signature2018,
  SphereonEd25519Signature2020,
  SphereonJsonWebSignature2020,
} from '@sphereon/ssi-sdk-vc-handler-ld-local';
import {createAgent, ICredentialPlugin, IDataStore, IDataStoreORM, IDIDManager, IKeyManager, IResolver} from '@veramo/core';
import {CredentialPlugin, ICredentialIssuer} from '@veramo/credential-w3c';
import {DataStore, DataStoreORM, DIDStore, KeyStore, PrivateKeyStore} from '@veramo/data-store';
import {DIDManager} from '@veramo/did-manager';
import {EthrDIDProvider} from '@veramo/did-provider-ethr';
import {getDidIonResolver, IonDIDProvider} from '@veramo/did-provider-ion';
import {getDidKeyResolver, KeyDIDProvider} from '@veramo/did-provider-key';
import {DIDResolverPlugin} from '@veramo/did-resolver';
import {KeyManager} from '@veramo/key-manager';
import {KeyManagementSystem, SecretBox} from '@veramo/kms-local';
import {OrPromise} from '@veramo/utils';
import {Resolver} from 'did-resolver';
import {DataSource} from 'typeorm';
import {getResolver as webDIDResolver} from 'web-did-resolver';

import {DID_PREFIX, DIF_UNIRESOLVER_RESOLVE_URL, SPHEREON_UNIRESOLVER_RESOLVE_URL} from '../@config/constants';
import {LdContexts} from '../@config/credentials';
import {DB_CONNECTION_NAME, DB_ENCRYPTION_KEY} from '../@config/database';
import {getDbConnection} from '../services/databaseService';
import {KeyManagementSystemEnum, SupportedDidMethodEnum} from '../types';

export const didResolver = new Resolver({
  ...getDidKeyResolver(),
  ...getUniResolver(SupportedDidMethodEnum.DID_LTO, {
    resolveUrl: SPHEREON_UNIRESOLVER_RESOLVE_URL,
  }),
  ...getUniResolver(SupportedDidMethodEnum.DID_FACTOM, {
    resolveUrl: SPHEREON_UNIRESOLVER_RESOLVE_URL,
  }),
  ...getUniResolver(SupportedDidMethodEnum.DID_ETHR, {
    resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL,
  }),
  ...getUniResolver(SupportedDidMethodEnum.DID_ETHR, {
    resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL,
  }),
  ...webDIDResolver,
  ...getDidIonResolver(),
  ...getDidJwkResolver(),
});

export const didMethodsSupported = Object.keys(didResolver['registry']).map(method => method.toLowerCase().replace('did:', ''));

export const didProviders = {
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ETHR}`]: new EthrDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
    network: 'ropsten',
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_KEY}`]: new KeyDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_LTO}`]: new LtoDidProvider({
    connectionMode: IDidConnectionMode.NODE,
    sponsorPrivateKeyBase58: '5gqCU5NbwU4gc62be39LXDDALKj8opj1KZszx7ULJc2k33kk52prn8D1H2pPPwm6QVKvkuo72YJSoUhzzmAFmDH8',
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

const agent = createAgent<
  IDIDManager &
    IKeyManager &
    IDataStore &
    IDataStoreORM &
    IResolver &
    IDidAuthSiopOpAuthenticator &
    IContactManager &
    ICredentialPlugin &
    ICredentialIssuer &
    ICredentialHandlerLDLocal
>({
  plugins: [
    new DataStore(dbConnection),
    new DataStoreORM(dbConnection),
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(privateKeyStore),
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
  ],
});

export const didManagerCreate = agent.didManagerCreate;
export const didManagerFind = agent.didManagerFind;
export const cmGetContacts = agent.cmGetContacts;
export const cmAddContact = agent.cmAddContact;
export const cmUpdateContact = agent.cmUpdateContact;
export const cmRemoveContact = agent.cmRemoveContact;
export const cmAddIdentity = agent.cmAddIdentity;
export const cmGetIdentities = agent.cmGetIdentities;
export const didManagerGet = agent.didManagerGet;
export const dataStoreORMGetVerifiableCredentials = agent.dataStoreORMGetVerifiableCredentials;
export const dataStoreSaveVerifiableCredential = agent.dataStoreSaveVerifiableCredential;
export const keyManagerSign = agent.keyManagerSign;
export const dataStoreGetVerifiableCredential = agent.dataStoreGetVerifiableCredential;
export const dataStoreDeleteVerifiableCredential = agent.dataStoreDeleteVerifiableCredential;
export const createVerifiableCredential = agent.createVerifiableCredential;
export default agent;

export const agentContext = {...agent.context, agent};
