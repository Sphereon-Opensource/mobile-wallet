import {getDidOydResolver, OydDIDProvider} from '@sphereon/did-provider-oyd';
import {JwkDIDProvider} from '@sphereon/ssi-sdk-ext.did-provider-jwk';
import {getDidKeyResolver, SphereonKeyDidProvider} from '@sphereon/ssi-sdk-ext.did-provider-key';
import {getResolver as getDidEbsiResolver} from '@sphereon/ssi-sdk-ext.did-resolver-ebsi';
import {getDidJwkResolver} from '@sphereon/ssi-sdk-ext.did-resolver-jwk';
import {LinkHandlers, LogLinkHandler} from '@sphereon/ssi-sdk.core';
import {createAgent} from '@veramo/core';
import {OrPromise} from '@veramo/utils';
import {Resolver} from 'did-resolver';
import {DataSource} from 'typeorm';
import {getResolver as webDIDResolver} from 'web-did-resolver';
import {DID_PREFIX} from '../@config/constants';
import {DEFAULT_DB_CONNECTION} from '../services/databaseService';
import {IRequiredContext, KeyManagementSystemEnum, SupportedDidMethodEnum, TAgentTypes} from '../types';
import {createAgentPlugins} from './plugins';

export const didResolver = new Resolver({
  ...getDidEbsiResolver(),
  ...getDidKeyResolver(),
  ...webDIDResolver(),
  ...getDidJwkResolver(),
  ...getDidOydResolver(),
});

export const didMethodsSupported = Object.keys(didResolver['registry']).map(method => method.toLowerCase().replace('did:', ''));

export const didProviders = {
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_KEY}`]: new SphereonKeyDidProvider({
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

export const linkHandlers: LinkHandlers = new LinkHandlers().add(new LogLinkHandler());

const agent = createAgent<TAgentTypes>({
  plugins: createAgentPlugins({dbConnection}),
});

export default agent;
export const agentContext: IRequiredContext = {...agent.context, agent};
