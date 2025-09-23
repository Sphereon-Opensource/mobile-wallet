import {getDidOydResolver, OydDIDProvider} from '@sphereon/did-provider-oyd';
import {com} from '@sphereon/kmp-mdoc-core';
import {JwkDIDProvider} from '@sphereon/ssi-sdk-ext.did-provider-jwk';
import {getDidKeyResolver, SphereonKeyDidProvider} from '@sphereon/ssi-sdk-ext.did-provider-key';
import {getResolver as getDidEbsiResolver} from '@sphereon/ssi-sdk-ext.did-resolver-ebsi';
import {getDidJwkResolver} from '@sphereon/ssi-sdk-ext.did-resolver-jwk';
import {LinkHandlers, LogLinkHandler} from '@sphereon/ssi-sdk.core';
import {CoseCryptoService} from '@sphereon/ssi-sdk.mdl-mdoc';
import {createAgent} from '@veramo/core';
import {OrPromise} from '@veramo/utils';
import {Resolver} from 'did-resolver';
import {DataSource} from 'typeorm';
import {getResolver as webDIDResolver} from 'web-did-resolver';
import {DID_PREFIX} from '../@config/constants';
import {DEFAULT_DB_CONNECTION} from '../services/databaseService';
import {IRequiredContext, SupportedDidMethodEnum, TAgentTypes} from '../types';
import {createAgentPlugins} from './plugins';
import DefaultCallbacks = com.sphereon.crypto.DefaultCallbacks;
import {DefaultOydCmsmCallbacks} from '@sphereon/did-provider-oyd';
import {SphereonKeyManager} from '@sphereon/ssi-sdk-ext.key-manager';

export const didResolver = new Resolver({
  ...getDidEbsiResolver(),
  ...getDidKeyResolver(),
  ...webDIDResolver(),
  ...getDidJwkResolver(),
  ...getDidOydResolver(),
});

export const didMethodsSupported = Object.keys(didResolver['registry']).map(method => method.toLowerCase().replace('did:', ''));

export const didProviders = ({keyManager, defaultKms = keyManager.defaultKms}: {defaultKms?: string, keyManager: SphereonKeyManager})  => {
  return {
    [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_KEY}`]: new SphereonKeyDidProvider({}),
    [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_JWK}`]: new JwkDIDProvider({}),
    [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_OYD}`]: new OydDIDProvider({defaultKms, clientManagedSecretMode: new DefaultOydCmsmCallbacks(keyManager)}),
  }
};

const dbConnection: OrPromise<DataSource> = DEFAULT_DB_CONNECTION;

export const linkHandlers: LinkHandlers = new LinkHandlers().add(new LogLinkHandler());

const agent = createAgent<TAgentTypes>({
  plugins: createAgentPlugins({dbConnection}),
});

export default agent;
export const agentContext: IRequiredContext = {...agent.context, agent};

DefaultCallbacks.setCoseCryptoDefault(new CoseCryptoService(agentContext));
