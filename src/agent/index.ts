import { VerifiedAuthorizationRequest } from '@sphereon/did-auth-siop'
import { getUniResolver } from '@sphereon/did-uni-client'
import { ConnectionManager, IConnectionManager } from '@sphereon/ssi-sdk-connection-manager'
import { ConnectionStore } from '@sphereon/ssi-sdk-data-store'
import { DidAuthSiopOpAuthenticator, IDidAuthSiopOpAuthenticator } from '@sphereon/ssi-sdk-did-auth-siop-authenticator'
import { getDidJwkResolver, JwkDIDProvider } from '@sphereon/ssi-sdk-jwk-did-provider'
import { IDidConnectionMode, LtoDidProvider } from '@sphereon/ssi-sdk-lto-did-provider'
import {
  CredentialHandlerLDLocal,
  ICredentialHandlerLDLocal,
  SphereonBbsBlsSignature2020,
  SphereonEd25519Signature2018,
  SphereonEd25519Signature2020,
  SphereonJsonWebSignature2020
} from '@sphereon/ssi-sdk-vc-handler-ld-local'
import { createAgent, IDataStore, IDataStoreORM, IDIDManager, IKeyManager, IResolver } from '@veramo/core'
import { DataStore, DataStoreORM, DIDStore, KeyStore, PrivateKeyStore } from '@veramo/data-store'
import { DIDManager } from '@veramo/did-manager'
import { EthrDIDProvider } from '@veramo/did-provider-ethr'
import { getDidIonResolver, IonDIDProvider } from '@veramo/did-provider-ion'
import { getDidKeyResolver, KeyDIDProvider } from '@veramo/did-provider-key'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { KeyManager } from '@veramo/key-manager'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import { Resolver } from 'did-resolver'

import { DID_PREFIX, DIF_UNIRESOLVER_RESOLVE_URL, SPHEREON_UNIRESOLVER_RESOLVE_URL } from '../@config/constants'
import { LdContexts } from '../@config/credentials'
import { DB_CONNECTION_NAME, DB_ENCRYPTION_KEY } from '../@config/database'
import RootNavigation from '../navigation/rootNavigation'
import { getDbConnection } from '../services/databaseService'
import { signPresentation } from '../services/signatureService'
import { CustomApprovalEnum, KeyManagementSystemEnum, ScreenRoutesEnum, SupportedDidMethodEnum } from '../types'
import { scanFingerPrint } from '../utils/BiometricUtils'

export const didResolver = new Resolver({
  ...getDidKeyResolver(),
  ...getUniResolver(SupportedDidMethodEnum.DID_LTO, {
    resolveUrl: SPHEREON_UNIRESOLVER_RESOLVE_URL
  }),
  ...getUniResolver(SupportedDidMethodEnum.DID_FACTOM, {
    resolveUrl: SPHEREON_UNIRESOLVER_RESOLVE_URL
  }),
  ...getUniResolver(SupportedDidMethodEnum.DID_ETHR, {
    resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL
  }),
  ...getDidIonResolver(),
  ...getDidJwkResolver()
})

export const didProviders = {
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ETHR}`]: new EthrDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
    network: 'ropsten'
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_KEY}`]: new KeyDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_LTO}`]: new LtoDidProvider({
    connectionMode: IDidConnectionMode.NODE,
    sponsorPrivateKeyBase58: '5gqCU5NbwU4gc62be39LXDDALKj8opj1KZszx7ULJc2k33kk52prn8D1H2pPPwm6QVKvkuo72YJSoUhzzmAFmDH8',
    defaultKms: KeyManagementSystemEnum.LOCAL
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ION}`]: new IonDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_JWK}`]: new JwkDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL
  })
}

const dbConnection = getDbConnection(DB_CONNECTION_NAME)
const privateKeyStore: PrivateKeyStore = new PrivateKeyStore(dbConnection, new SecretBox(DB_ENCRYPTION_KEY))

const agent = createAgent<
  IDIDManager &
    IKeyManager &
    IDataStore &
    IDataStoreORM &
    IResolver &
    IDidAuthSiopOpAuthenticator &
    IConnectionManager &
    ICredentialHandlerLDLocal
>({
  plugins: [
    new DataStore(dbConnection),
    new DataStoreORM(dbConnection),
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(privateKeyStore)
      }
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: `${DID_PREFIX}:${SupportedDidMethodEnum.DID_JWK}`,
      providers: didProviders
    }),
    new DIDResolverPlugin({
      resolver: didResolver
    }),
    new DidAuthSiopOpAuthenticator(signPresentation, {
      [CustomApprovalEnum.PEX]: async (
        verifiedAuthorizationRequest: VerifiedAuthorizationRequest,
        sessionId: string
      ) => {
        RootNavigation.navigate(ScreenRoutesEnum.PEX_VERIFICATION, {
          request: verifiedAuthorizationRequest,
          sessionId
        })
        return Promise.reject(Error('Pex verification manual stop'))
      },
      [CustomApprovalEnum.FINGERPRINT]: async () => scanFingerPrint()
    }),
    new ConnectionManager({
      store: new ConnectionStore(dbConnection)
    }),
    new CredentialHandlerLDLocal({
      contextMaps: [LdContexts],
      suites: [
        new SphereonEd25519Signature2018(),
        new SphereonEd25519Signature2020(),
        new SphereonBbsBlsSignature2020(),
        new SphereonJsonWebSignature2020()
      ],
      keyStore: privateKeyStore
    })
  ]
})

export const didManagerCreate = agent.didManagerCreate
export const didManagerFind = agent.didManagerFind
export const registerSessionForSiop = agent.registerSessionForSiop
export const getSessionForSiop = agent.getSessionForSiop
export const authenticateWithSiop = agent.authenticateWithSiop
export const cmGetParty = agent.cmGetParty
export const cmGetParties = agent.cmGetParties
export const cmAddParty = agent.cmAddParty
export const cmAddConnection = agent.cmAddConnection
export const didManagerGet = agent.didManagerGet
export const dataStoreORMGetVerifiableCredentials = agent.dataStoreORMGetVerifiableCredentials
export const dataStoreSaveVerifiableCredential = agent.dataStoreSaveVerifiableCredential
export const getSiopAuthorizationRequestDetails = agent.getSiopAuthorizationRequestDetails
export const sendSiopAuthorizationResponse = agent.sendSiopAuthorizationResponse
export const keyManagerSign = agent.keyManagerSign
export const dataStoreGetVerifiableCredential = agent.dataStoreGetVerifiableCredential
export const dataStoreDeleteVerifiableCredential = agent.dataStoreDeleteVerifiableCredential
export const createVerifiableCredentialLDLocal = agent.createVerifiableCredentialLDLocal
export default agent
