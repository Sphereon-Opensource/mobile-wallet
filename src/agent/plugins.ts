import {IdentifierResolution, isManagedIdentifierDidResult} from '@sphereon/ssi-sdk-ext.identifier-resolution';
import {JwtService} from '@sphereon/ssi-sdk-ext.jwt-service';
import {MemoryPrivateKeyStore, SphereonKeyManager} from '@sphereon/ssi-sdk-ext.key-manager';
import {MusapKeyManagementSystem} from '@sphereon/ssi-sdk-ext.kms-musap-rn';
import {ContactManager} from '@sphereon/ssi-sdk.contact-manager';
import {LinkHandlerEventType, LinkHandlerPlugin} from '@sphereon/ssi-sdk.core';
import {CredentialStore} from '@sphereon/ssi-sdk.credential-store';
import {CredentialValidation} from '@sphereon/ssi-sdk.credential-validation';
import {
  ContactStore,
  DigitalCredentialStore,
  EventLoggerStore,
  IssuanceBrandingStore,
  MachineStateStore,
} from '@sphereon/ssi-sdk.data-store';
import {
  ICredentialBranding,
  Party,
} from '@sphereon/ssi-sdk.data-store-types';
import {EventLogger} from '@sphereon/ssi-sdk.event-logger';
import {IssuanceBranding} from '@sphereon/ssi-sdk.issuance-branding';
import {MDLMdoc} from '@sphereon/ssi-sdk.mdl-mdoc';
import {OID4VCIHolder, OnContactIdentityCreatedArgs, OnCredentialStoredArgs, OnIdentifierCreatedArgs} from '@sphereon/ssi-sdk.oid4vci-holder';
import {OIDFClient} from '@sphereon/ssi-sdk.oidf-client';
import {QrCodeProvider} from '@sphereon/ssi-sdk.qr-code-generator';
import {ResourceResolver} from '@sphereon/ssi-sdk.resource-resolver';
import {SDJwtPlugin} from '@sphereon/ssi-sdk.sd-jwt';
import {DidAuthSiopOpAuthenticator} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {MachineStatePersistence, MachineStatePersistEventType} from '@sphereon/ssi-sdk.xstate-machine-persistence';
import {ActionType, DefaultActionSubType, InitiatorType, LoggingEventType, LogLevel, OrPromise, SubSystem, System} from '@sphereon/ssi-types';
import {IAgentPlugin, VerifiableCredential} from '@veramo/core';
import {DataStore, DataStoreORM, DIDStore, KeyStore} from '@veramo/data-store';
import {DIDManager} from '@veramo/did-manager';
import {DIDResolverPlugin} from '@veramo/did-resolver';
import {DataSource} from 'typeorm';
import {animoFunkeCert, funkeTestCA, sphereonCA, sphereonFunke} from '../@config/trustanchors';
import {PIDIssuerPresentationSigning} from '../providers/authentication/funke/PIDIssuerPresentationSigning';
import {dispatchIdentifier} from '../services/identityService';
import {verifySDJWTSignature} from '../services/signatureService';
import store from '../store';
import {dispatchVerifiableCredential} from '../store/actions/credential.actions';
import {storeActivityLogging} from '../store/actions/logging.actions';
import {DEFAULT_DID_PREFIX_AND_METHOD} from '../types';
import {ADD_IDENTITY_SUCCESS} from '../types/store/contact.action.types';
import {generateDigest, generateSalt, getCredentialIssuerContact, getCredentialSubjectContact} from '../utils';
import agent, {didProviders, didResolver, linkHandlers} from './index';
import {AZURE_KEYVAULT_REST_API_KEY, AZURE_KEYVAULT_REST_APPLICATION_ID, AZURE_KEYVAULT_REST_URL} from 'react-native-dotenv';
import {AzureKeyVaultKeyManagementSystemRestClient} from '@sphereon/ssi-sdk-ext.kms-azure-rest-client';
import {mapPIDSecurityModelToKMS, PIDSecurityModel, storageGetMsisdnSync, storageGetPIDSecurityModelSync} from '../services/storageService';
import {MusapClient} from '@sphereon/musap-react-native';
import {SphereonKeyManagementSystem} from '@sphereon/ssi-sdk-ext.kms-local';
import {CredentialSummary, toCredentialSummary} from '@sphereon/ui-components.credential-branding';
import {VcdmCredentialPlugin} from '@sphereon/ssi-sdk.credential-vcdm';
import {CredentialProviderVcdm2Jose} from '@sphereon/ssi-sdk.credential-vcdm2-jose-provider';
import {CredentialProviderJWT} from '@sphereon/ssi-sdk.credential-vcdm1-jwt-provider';

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
    .contact.contacts.find((contact: Party) => contact.identities.some(identity => identity.identifier.correlationId === credential.issuerCorrelationId));

    const credentialsBranding: Array<ICredentialBranding> = await agent.ibGetCredentialBranding({filter: [{vcHash}]});
    const uniform = JSON.parse(credential.uniformDocument) as VerifiableCredential;
    const issuer: Party | undefined = getCredentialIssuerContact(uniform as VerifiableCredential);
    const credentialSummary: CredentialSummary = await toCredentialSummary({
      verifiableCredential: uniform as VerifiableCredential,
      hash: credential.hash,
      credentialRole: credential.credentialRole,
      branding: credentialsBranding[0]?.localeBranding,
      issuer,
      subject: getCredentialSubjectContact(uniform as VerifiableCredential),
    });

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
        data: {
          credential: credentialSummary,
        },
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
  defaultAuthorizationRequestOptions: {
    clientId: 'https://sphereon.com/ssi-wallet',
    redirectUri: 'https://sphereon.com/ssi-wallet/oid4vci-callback',
  },
});

export const funkeC2Issuer = 'https://demo.pid-issuer.bundesdruckerei.de/c2';

const getMusapKeyManagementSystem = (pidSecurityModel: PIDSecurityModel) => {
  if (pidSecurityModel === PIDSecurityModel.MOBILE_OPERATOR_ESIM) {
    const msIsdn = storageGetMsisdnSync(); // FIXME use pidSecurityModel
    const linkId = MusapClient.getLink();
    if (msIsdn && linkId) {
      // Use eSim signing when we have a msisdn
      console.log('Found msIsdn & linkId, enabling eSim KMS');
      return new MusapKeyManagementSystem('EXTERNAL', 'eSim', {
        externalSscdSettings: {
          // FIXME this is still mandatory for ExternalSscd
          clientId: 'SCO',
        },
        defaultSignAttributes: {
          msisdn: msIsdn,
          mimetype: 'application/x-sha256',
          signaturetype: 'pkcs1',
        },
      });
    }
  }

  return new MusapKeyManagementSystem('TEE');

  // TODO YubiKey as well?
};

export let sphereonKeyManager: SphereonKeyManager;

const buildSphereonKeyManager = (dbConnection: Promise<DataSource> | DataSource) => {
  let pidSecurityModel = storageGetPIDSecurityModelSync() ?? PIDSecurityModel.SECURE_ELEMENT;

  sphereonKeyManager = new SphereonKeyManager({
    store: new KeyStore(dbConnection),
    kms: {
      ephemeral: new SphereonKeyManagementSystem(new MemoryPrivateKeyStore()),
      musap: getMusapKeyManagementSystem(pidSecurityModel),
      azureKeyVault: new AzureKeyVaultKeyManagementSystemRestClient({
        applicationId: AZURE_KEYVAULT_REST_APPLICATION_ID,
        apiKey: AZURE_KEYVAULT_REST_API_KEY,
        vaultUrl: AZURE_KEYVAULT_REST_URL,
      }),
    },
  });
  sphereonKeyManager.defaultKms = mapPIDSecurityModelToKMS(pidSecurityModel);
};


const vcdm2Jose = new CredentialProviderVcdm2Jose();
/*const vcdmJsonld = new CredentialProviderJsonld({
  contextMaps: [LdContexts],
  suites: [
    new SphereonEd25519Signature2018(),
    new SphereonEd25519Signature2020(),
  ],
});*/
const vcdm1Jwt = new CredentialProviderJWT();
const issuers = [vcdm2Jose, vcdm1Jwt];

export const createAgentPlugins = ({dbConnection}: {dbConnection: OrPromise<DataSource>}): Array<IAgentPlugin> => {
  buildSphereonKeyManager(dbConnection);


  return [
    new DataStore(dbConnection),
    new DataStoreORM(dbConnection),
    // @ts-ignore
    new IdentifierResolution({crypto: global.crypto}),
    // The Animo funke cert is self-signed and not issued by a CA. Since we perform strict checks on certs, we blindly trust if for the Funke
    new MDLMdoc({trustAnchors: [sphereonCA, funkeTestCA, sphereonFunke], opts: {blindlyTrustedAnchors: [animoFunkeCert]}}),
    new JwtService(),
    new EventLogger({
      store: new EventLoggerStore(dbConnection),
      eventTypes: [LoggingEventType.ACTIVITY, LoggingEventType.GENERAL, LoggingEventType.AUDIT],
    }),
    sphereonKeyManager,
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: DEFAULT_DID_PREFIX_AND_METHOD,
      providers: didProviders({keyManager: sphereonKeyManager}),
    }),
    new DIDResolverPlugin({
      resolver: didResolver,
    }),
    new DidAuthSiopOpAuthenticator({hasher: generateDigest}),
    new ContactManager({
      store: new ContactStore(dbConnection),
    }),
    new IssuanceBranding({
      store: new IssuanceBrandingStore(dbConnection),
    }),

    new VcdmCredentialPlugin({issuers}),
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
    new SDJwtPlugin(
      {
        // We hookup a custom signer for the C2 flow. IT delegates the KB signing to the PID Issuer
        signers: {[funkeC2Issuer]: new PIDIssuerPresentationSigning(funkeC2Issuer).kbPresentationSigner},
        hasher: generateDigest,
        saltGenerator: generateSalt,
        verifySignature: verifySDJWTSignature,
      },
      [sphereonCA, funkeTestCA, sphereonFunke],
    ),
    new CredentialValidation(),
    new OIDFClient(),
    new QrCodeProvider(),
    new ResourceResolver(),
  ];
};
