import {getDidOydResolver, OydDIDProvider} from '@sphereon/did-provider-oyd';
import {JwkDIDProvider} from '@sphereon/ssi-sdk-ext.did-provider-jwk';
import {getDidKeyResolver, SphereonKeyDidProvider} from '@sphereon/ssi-sdk-ext.did-provider-key';
import {getResolver as getDidEbsiResolver} from '@sphereon/ssi-sdk-ext.did-resolver-ebsi';
import {getDidJwkResolver} from '@sphereon/ssi-sdk-ext.did-resolver-jwk';
import {SphereonKeyManager} from '@sphereon/ssi-sdk-ext.key-manager';
import {ContactManager} from '@sphereon/ssi-sdk.contact-manager';
import {LinkHandlerEventType, LinkHandlerPlugin, LinkHandlers, LogLinkHandler} from '@sphereon/ssi-sdk.core';
import {OnIdentifierCreatedArgs} from '@sphereon/ssi-sdk.oid4vci-holder/src/types/IOID4VCIHolder';
import {ContactStore, DigitalCredentialStore, IssuanceBrandingStore, MachineStateStore} from '@sphereon/ssi-sdk.data-store';
import {IssuanceBranding} from '@sphereon/ssi-sdk.issuance-branding';
import {OID4VCIHolder, OnContactIdentityCreatedArgs, OnCredentialStoredArgs} from '@sphereon/ssi-sdk.oid4vci-holder';
import {DidAuthSiopOpAuthenticator} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
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
import {IonDIDProvider} from '@veramo/did-provider-ion';
import {DIDResolverPlugin} from '@veramo/did-resolver';
import {SecretBox} from '@veramo/kms-local';
import {OrPromise} from '@veramo/utils';
import {Resolver} from 'did-resolver';
import {DataSource} from 'typeorm';
import {getResolver as webDIDResolver} from 'web-did-resolver';
import {DID_PREFIX} from '../@config/constants';
import {DB_ENCRYPTION_KEY} from '../@config/database';
import {DEFAULT_DB_CONNECTION} from '../services/databaseService';
import {IRequiredContext, KeyManagementSystemEnum, SupportedDidMethodEnum, TAgentTypes} from '../types';
import {createAgentPlugins} from './plugins';
//import {MusapKeyManagementSystem} from '@sphereon/ssi-sdk-ext.kms-musap-rn';

export const didResolver = new Resolver({
  ...getDidEbsiResolver(),
  ...getDidKeyResolver(),
  ...webDIDResolver(),
  ...getDidJwkResolver(),
  ...getDidOydResolver(),
});

export const didMethodsSupported = Object.keys(didResolver['registry']).map(method => method.toLowerCase().replace('did:', ''));

export const didProviders = {
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ETHR}`]: new EthrDIDProvider({
    defaultKms: KeyManagementSystemEnum.MUSAP_TEE,
    network: 'goerli',
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_KEY}`]: new SphereonKeyDidProvider({
    defaultKms: KeyManagementSystemEnum.MUSAP_TEE,
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ION}`]: new IonDIDProvider({
    defaultKms: KeyManagementSystemEnum.MUSAP_TEE,
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_JWK}`]: new JwkDIDProvider({
    defaultKms: KeyManagementSystemEnum.MUSAP_TEE,
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_OYD}`]: new OydDIDProvider({
    defaultKms: KeyManagementSystemEnum.MUSAP_TEE,
  }),
};

const dbConnection: OrPromise<DataSource> = DEFAULT_DB_CONNECTION;
const privateKeyStore: PrivateKeyStore = new PrivateKeyStore(dbConnection, new SecretBox(DB_ENCRYPTION_KEY));

export const linkHandlers: LinkHandlers = new LinkHandlers().add(new LogLinkHandler());

const agent = createAgent<TAgentTypes>({
  plugins: createAgentPlugins({privateKeyStore, dbConnection}),
});

export default agent;
export const agentContext: IRequiredContext = {...agent.context, agent};
