import {IdentifierResolution, isManagedIdentifierDidResult} from '@sphereon/ssi-sdk-ext.identifier-resolution';
import {JwtService} from '@sphereon/ssi-sdk-ext.jwt-service';
import {SphereonKeyManager} from '@sphereon/ssi-sdk-ext.key-manager';
import {MusapKeyManagementSystem} from '@sphereon/ssi-sdk-ext.kms-musap-rn';
import {ContactManager} from '@sphereon/ssi-sdk.contact-manager';
import {LinkHandlerEventType, LinkHandlerPlugin} from '@sphereon/ssi-sdk.core';
import {CredentialStore} from '@sphereon/ssi-sdk.credential-store';
import {ContactStore, DigitalCredentialStore, EventLoggerStore, IssuanceBrandingStore, MachineStateStore} from '@sphereon/ssi-sdk.data-store';
import {IssuanceBranding} from '@sphereon/ssi-sdk.issuance-branding';
import {MDLMdoc} from '@sphereon/ssi-sdk.mdl-mdoc';
import {OID4VCIHolder, OnContactIdentityCreatedArgs, OnCredentialStoredArgs, OnIdentifierCreatedArgs} from '@sphereon/ssi-sdk.oid4vci-holder';
import {SDJwtPlugin} from '@sphereon/ssi-sdk.sd-jwt';
import {DidAuthSiopOpAuthenticator} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {MachineStatePersistence, MachineStatePersistEventType} from '@sphereon/ssi-sdk.xstate-machine-persistence';
import {EventLogger} from '@sphereon/ssi-sdk.event-logger';
import {ActionType, DefaultActionSubType, InitiatorType, LoggingEventType, LogLevel, OrPromise, SubSystem, System} from '@sphereon/ssi-types';
import {IAgentPlugin} from '@veramo/core';
import {CredentialPlugin} from '@veramo/credential-w3c';
import {DataStore, DataStoreORM, DIDStore, KeyStore} from '@veramo/data-store';
import {DIDManager} from '@veramo/did-manager';
import {DIDResolverPlugin} from '@veramo/did-resolver';
import {DataSource} from 'typeorm';
import {animoFunkeCert, funkeTestCA, sphereonCA} from '../@config/trustanchors';
import {PIDIssuerPresentationSigning} from '../providers/authentication/funke/PIDIssuerPresentationSigning';
import {dispatchIdentifier} from '../services/identityService';
import {verifySDJWTSignature} from '../services/signatureService';
import store from '../store';
import {dispatchVerifiableCredential} from '../store/actions/credential.actions';
import {ADD_IDENTITY_SUCCESS} from '../types/store/contact.action.types';
import {generateDigest, generateSalt} from '../utils';
import {didProviders, didResolver, linkHandlers} from './index';
import {DEFAULT_DID_PREFIX_AND_METHOD} from '../types';
import {OIDFClient} from '@sphereon/ssi-sdk.oidf-client';
import {QrCodeProvider} from '@sphereon/ssi-sdk.qr-code-generator';
import {CredentialValidation} from '@sphereon/ssi-sdk.credential-validation';
import {ResourceResolver} from '@sphereon/ssi-sdk.resource-resolver';
import {storeActivityLogging} from '../store/actions/logging.actions';
import {AnomalyDetection} from '@sphereon/ssi-sdk.anomaly-detection';
import * as RNDnsLookup from 'react-native-dns-lookup';

const mmdbGeoLite = require('../assets/mmdb/GeoLite2-Country.mmdb.json');

export const oid4vciHolder = new OID4VCIHolder({
  onContactIdentityCreated: async (args: OnContactIdentityCreatedArgs): Promise<void> => {
    store.dispatch({type: ADD_IDENTITY_SUCCESS, payload: args});
  },
  onCredentialStored: async (args: OnCredentialStoredArgs): Promise<void> => {
    const {credential, vcHash} = args;
    store.dispatch<any>(dispatchVerifiableCredential(vcHash, credential));

    // FIXME temp solution to have activity for oid4vci-holder, we should add this to the plugin later
    const contact = store
      .getState()
      .contact.contacts.find(contact => contact.identities.some(identity => identity.identifier.correlationId === credential.issuerCorrelationId));

    store.dispatch<any>(
      storeActivityLogging({
        level: LogLevel.INFO,
        system: System.OID4VCI,
        subSystemType: SubSystem.VC_ISSUER,
        initiatorType: InitiatorType.SYSTEM,
        description: 'onCredentialStored event call',
        actionType: ActionType.CREATE,
        actionSubType: DefaultActionSubType.VC_ISSUE,
        diagnosticData: {digitalCredential: credential},
        // @ts-ignore
        credentialType: credential.documentFormat, // TODO fix types
        credentialHash: vcHash,
        originalCredential: JSON.stringify(credential),
        // @ts-ignore
        partyCorrelationType: contact?.identities[0].identifier.type, // TODO fix types
        partyCorrelationId: contact?.identities[0].identifier.correlationId,
        partyAlias: contact?.contact.displayName,
      }),
    );
  },
  onIdentifierCreated: async (args: OnIdentifierCreatedArgs): Promise<void> => {
    const {identifier} = args;
    if (isManagedIdentifierDidResult(identifier)) {
      await dispatchIdentifier({identifier: identifier.identifier});
    }
  },
  hasher: generateDigest,
});

export const funkeC2Issuer = 'https://demo.pid-issuer.bundesdruckerei.de/c2';

export const createAgentPlugins = ({dbConnection}: {dbConnection: OrPromise<DataSource>}): Array<IAgentPlugin> => {
  return [
    new DataStore(dbConnection),
    new DataStoreORM(dbConnection),
    new IdentifierResolution({crypto: global.crypto}),
    // The Animo funke cert is self-signed and not issued by a CA. Since we perform strict checks on certs, we blindly trust if for the Funke
    new MDLMdoc({trustAnchors: [sphereonCA, funkeTestCA], opts: {blindlyTrustedAnchors: [animoFunkeCert]}}),
    new JwtService(),
    new EventLogger({
      store: new EventLoggerStore(dbConnection),
      eventTypes: [LoggingEventType.ACTIVITY, LoggingEventType.GENERAL, LoggingEventType.AUDIT],
    }),
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
    new JwtService(),
    new DidAuthSiopOpAuthenticator(),
    new ContactManager({
      store: new ContactStore(dbConnection),
    }),
    new IssuanceBranding({
      store: new IssuanceBrandingStore(dbConnection),
    }),
    new CredentialPlugin(),
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
      // We hookup a custom signer for the C2 flow. IT delegates the KB signing to the PID Issuer
      signers: {[funkeC2Issuer]: new PIDIssuerPresentationSigning(funkeC2Issuer).kbPresentationSigner},
      hasher: generateDigest,
      saltGenerator: generateSalt,
      verifySignature: verifySDJWTSignature,
    }),
    new CredentialValidation(),
    new OIDFClient(),
    new QrCodeProvider(),
    new AnomalyDetection({
      geoIpDB: Buffer.from(mmdbGeoLite.data, 'base64'),
      dnsLookupCallback: async (hostname: string) => {
        const address = await RNDnsLookup.getIpAddressesForHostname(hostname);
        if (!address || address.length === 0) {
          return Promise.reject(Error(`DNS lookup for hostname ${hostname}`));
        }
        return address[0];
      },
    }),
    new ResourceResolver(),
  ];
};
