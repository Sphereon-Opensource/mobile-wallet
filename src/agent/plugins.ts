import {IdentifierResolution, isManagedIdentifierDidResult} from '@sphereon/ssi-sdk-ext.identifier-resolution';
import {JwtService} from '@sphereon/ssi-sdk-ext.jwt-service';
import {SphereonKeyManager} from '@sphereon/ssi-sdk-ext.key-manager';
import {MusapKeyManagementSystem} from '@sphereon/ssi-sdk-ext.kms-musap-rn';
import {ContactManager} from '@sphereon/ssi-sdk.contact-manager';
import {LinkHandlerEventType, LinkHandlerPlugin} from '@sphereon/ssi-sdk.core';
import {CredentialStore} from '@sphereon/ssi-sdk.credential-store';
import {ContactStore, DigitalCredentialStore, IssuanceBrandingStore, MachineStateStore} from '@sphereon/ssi-sdk.data-store';
import {IssuanceBranding} from '@sphereon/ssi-sdk.issuance-branding';
import {MDLMdoc} from '@sphereon/ssi-sdk.mdl-mdoc';
import {OID4VCIHolder, OnContactIdentityCreatedArgs, OnCredentialStoredArgs, OnIdentifierCreatedArgs} from '@sphereon/ssi-sdk.oid4vci-holder';
import {SDJwtPlugin} from '@sphereon/ssi-sdk.sd-jwt';
import {DidAuthSiopOpAuthenticator} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {MachineStatePersistence, MachineStatePersistEventType} from '@sphereon/ssi-sdk.xstate-machine-persistence';
import {OrPromise} from '@sphereon/ssi-types';
import {IAgentPlugin} from '@veramo/core';
import {DataStore, DataStoreORM, DIDStore, KeyStore} from '@veramo/data-store';
import {DIDManager} from '@veramo/did-manager';
import {DIDResolverPlugin} from '@veramo/did-resolver';
import {DataSource} from 'typeorm';
import {animoFunkeCert, funkeTestCA, sphereonCA} from '../@config/trustanchors';
import {dispatchIdentifier} from '../services/identityService';
import {verifySDJWTSignature} from '../services/signatureService';
import store from '../store';
import {dispatchVerifiableCredential} from '../store/actions/credential.actions';
import {DEFAULT_DID_PREFIX_AND_METHOD} from '../types';
import {ADD_IDENTITY_SUCCESS} from '../types/store/contact.action.types';
import {generateDigest, generateSalt} from '../utils';
import {didProviders, didResolver, linkHandlers} from './index';

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
    if (isManagedIdentifierDidResult(identifier)) {
      await dispatchIdentifier({identifier: identifier.identifier});
    }
  },
  hasher: generateDigest,
});

export const createAgentPlugins = ({dbConnection}: {dbConnection: OrPromise<DataSource>}): Array<IAgentPlugin> => {
  return [
    new DataStore(dbConnection),
    new DataStoreORM(dbConnection),
    new IdentifierResolution(),
    // The Animo funke cert is self-signed and not issued by a CA. Since we perform strict checks on certs, we blindly trust if for the Funke
    new MDLMdoc({trustAnchors: [sphereonCA, funkeTestCA], opts: {blindlyTrustedAnchors: [animoFunkeCert]}}),
    new JwtService(),
    new SphereonKeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        musapTee: new MusapKeyManagementSystem('TEE'), // TODO YubiKey as well
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
    new IdentifierResolution({crypto: global.crypto}),
    new JwtService(),
    new DidAuthSiopOpAuthenticator(),
    new ContactManager({
      store: new ContactStore(dbConnection),
    }),
    new IssuanceBranding({
      store: new IssuanceBrandingStore(dbConnection),
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
