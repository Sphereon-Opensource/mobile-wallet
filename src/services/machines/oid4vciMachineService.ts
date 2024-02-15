import {CredentialResponse, CredentialSupported} from '@sphereon/oid4vci-common';
import {
  CorrelationIdentifierEnum,
  IBasicCredentialLocaleBranding,
  Identity,
  IdentityRoleEnum,
  NonPersistedIdentity,
  Party,
} from '@sphereon/ssi-sdk.data-store';
import {
  CredentialMapper,
  IVerifiableCredential,
  OriginalVerifiableCredential,
  W3CVerifiableCredential,
  WrappedVerifiableCredential,
} from '@sphereon/ssi-types';
import {VerifiableCredential} from '@veramo/core';
import {computeEntryHash} from '@veramo/utils';
import {URL} from 'react-native-url-polyfill';
import {v4 as uuidv4} from 'uuid';
import {translate} from '../../localization/Localization';
import OpenId4VcIssuanceProvider, {CredentialToAccept} from '../../providers/credential/OpenId4VcIssuanceProvider';
import store from '../../store';
import {addIdentity} from '../../store/actions/contact.actions';
import {storeVerifiableCredential} from '../../store/actions/credential.actions';
import {ICredentialTypeSelection, IVerificationResult} from '../../types/';
import {MappedCredentialToAccept, OID4VCIMachineContext} from '../../types/machines/oid4vci';
import {addCredentialBranding, selectAppLocaleBranding} from '../brandingService';
import {getContacts} from '../contactService';
import {verifyCredential} from '../credentialService';
import openId4VcIssuanceProvider from '../../providers/credential/OpenId4VcIssuanceProvider';

export const initiateOpenId4VcIssuanceProvider = async (context: Pick<OID4VCIMachineContext, 'requestData'>): Promise<OpenId4VcIssuanceProvider> => {
  const {requestData} = context;

  if (requestData?.uri === undefined) {
    return Promise.reject(Error('Missing request uri in context'));
  }

  return OpenId4VcIssuanceProvider.initiationFromUri({uri: requestData.uri});
};

export const createCredentialSelection = async (
  context: Pick<OID4VCIMachineContext, 'selectedCredentials' | 'authorizationCodeResponse'>,
): Promise<Array<ICredentialTypeSelection>> => {
  const {selectedCredentials, authorizationCodeResponse} = context;

  if (!openId4VcIssuanceProvider) {
    return Promise.reject(Error('Missing OpenId4VcIssuanceProvider in context'));
  }
  if (!openId4VcIssuanceProvider.credentialsSupported) {
    return Promise.reject(Error('OID4VCI issuance provider has no supported credentials'));
  }
  const credentialSelection: Array<ICredentialTypeSelection> = await Promise.all(
    openId4VcIssuanceProvider.credentialsSupported.map(async (credentialMetadata: CredentialSupported): Promise<ICredentialTypeSelection> => {
      if (!('types' in credentialMetadata)) {
        throw Error('SD-JWT not supported yet');
      }
      // FIXME this allows for duplicate VerifiableCredential, which the user has no idea which ones those are and we also have a branding map with unique keys, so some branding will not match
      const credentialType: string =
        credentialMetadata.types.find((type: string): boolean => type !== 'VerifiableCredential') ?? 'VerifiableCredential';
      const credentialAlias =
        (await selectAppLocaleBranding({localeBranding: openId4VcIssuanceProvider?.credentialBranding?.get(credentialType)}))?.alias ??
        credentialType;
      return {
        id: uuidv4(),
        credentialType,
        credentialAlias,
        isSelected: false,
      };
    }),
  );

  // TODO find better place to do this, would be nice if the machine does this?
  if (credentialSelection.length === 1) {
    selectedCredentials.push(credentialSelection[0].credentialType);
  }

  /*  if (!openId4VcIssuanceProvider.client.clientId) {
    openId4VcIssuanceProvider.client.clientId = openId4VcIssuanceProvider.credentialsSupported[0]
  }*/

  return credentialSelection;
};

export const retrieveContact = async (context: Pick<OID4VCIMachineContext, 'openId4VcIssuanceProvider'>): Promise<Party | undefined> => {
  const {openId4VcIssuanceProvider} = context;

  if (!openId4VcIssuanceProvider) {
    return Promise.reject(Error('Missing OID4VCI issuance provider in context'));
  }

  if (!openId4VcIssuanceProvider.serverMetadata) {
    return Promise.reject(Error('OID4VCI issuance provider has no server metadata'));
  }

  const correlationId: string = new URL(openId4VcIssuanceProvider.serverMetadata.issuer).hostname;
  return getContacts({
    filter: [
      {
        identities: {
          identifier: {
            correlationId,
          },
        },
      },
    ],
  }).then((contacts: Array<Party>): Party | undefined => (contacts.length === 1 ? contacts[0] : undefined));
};

export const retrieveCredentials = async (
  context: Pick<OID4VCIMachineContext, 'openId4VcIssuanceProvider' | 'verificationCode' | 'selectedCredentials' | 'authorizationCodeResponse'>,
): Promise<Array<MappedCredentialToAccept> | undefined> => {
  const {openId4VcIssuanceProvider, verificationCode, selectedCredentials, authorizationCodeResponse} = context;
  if (!openId4VcIssuanceProvider) {
    throw Error('Missing OID4VCI issuance provider in context');
  }
  openId4VcIssuanceProvider.authorizationCodeResponse = authorizationCodeResponse;
  return openId4VcIssuanceProvider
    ?.getCredentials({
      credentials: selectedCredentials,
      pin: verificationCode,
    })
    .then(
      (credentials: Array<CredentialToAccept>): Array<MappedCredentialToAccept> =>
        credentials.map((credential: CredentialToAccept): MappedCredentialToAccept => {
          const credentialResponse: CredentialResponse = credential.credentialResponse;
          const verifiableCredential: W3CVerifiableCredential | undefined = credentialResponse.credential;
          const wrappedVerifiableCredential: WrappedVerifiableCredential = CredentialMapper.toWrappedVerifiableCredential(
            verifiableCredential as OriginalVerifiableCredential,
          );
          if (wrappedVerifiableCredential?.credential?.compactSdJwtVc) {
            throw Error('SD-JWT not supported yet');
          }
          const uniformVerifiableCredential: IVerifiableCredential = <IVerifiableCredential>wrappedVerifiableCredential.credential;
          const rawVerifiableCredential: VerifiableCredential = credentialResponse.credential as unknown as VerifiableCredential;

          const correlationId: string =
            typeof uniformVerifiableCredential.issuer === 'string' ? uniformVerifiableCredential.issuer : uniformVerifiableCredential.issuer.id;

          return {
            correlationId,
            credential: credential,
            rawVerifiableCredential,
            uniformVerifiableCredential,
          };
        }),
    );
};

export const addContactIdentity = async (context: Pick<OID4VCIMachineContext, 'credentialsToAccept' | 'contact'>): Promise<Identity> => {
  const {credentialsToAccept, contact} = context;

  if (!contact) {
    return Promise.reject(Error('Missing contact in context'));
  }

  if (credentialsToAccept === undefined || credentialsToAccept.length === 0) {
    return Promise.reject(Error('Missing credential offers in context'));
  }

  const correlationId: string = credentialsToAccept[0].correlationId;
  const identity: NonPersistedIdentity = {
    alias: correlationId,
    roles: [IdentityRoleEnum.ISSUER],
    identifier: {
      type: CorrelationIdentifierEnum.DID,
      correlationId,
    },
  };
  return store.dispatch<any>(addIdentity({contactId: contact.id, identity}));
};

export const assertValidCredentials = async (context: Pick<OID4VCIMachineContext, 'credentialsToAccept'>): Promise<void> => {
  const {credentialsToAccept} = context;

  await Promise.all(
    credentialsToAccept.map(async (offer: MappedCredentialToAccept): Promise<void> => {
      const credential = offer.credential.credentialResponse.credential as OriginalVerifiableCredential;
      const wrappedVC = CredentialMapper.toWrappedVerifiableCredential(credential);
      if (wrappedVC.decoded.iss?.includes('did:ebsi:') || wrappedVC.decoded.vc?.issuer?.includes('did:ebsi:')) {
        if (JSON.stringify(wrappedVC.decoded).includes('vc:ebsi:conformance')) {
          console.log(`Skipping VC validation for EBSI conformance issued credential, as their Issuer is not present in the ledger (sigh)`);
          return;
        }
      }

      const verificationResult: IVerificationResult = await verifyCredential({
        credential: credential as VerifiableCredential,
        // TODO WAL-675 we might want to allow these types of options as part of the context, now we have state machines. Allows us to pre-determine whether these policies apply and whether remote context should be fetched
        fetchRemoteContexts: true,
        policies: {
          credentialStatus: false,
          expirationDate: false,
          issuanceDate: false,
        },
      });

      if (!verificationResult.result || verificationResult.error) {
        console.log('Verification of credential failed', JSON.stringify(verificationResult));
        return Promise.reject(Error(verificationResult.result ? verificationResult.error : translate('credential_verification_failed_message')));
      }
    }),
  );
};

export const storeCredentialBranding = async (
  context: Pick<OID4VCIMachineContext, 'openId4VcIssuanceProvider' | 'selectedCredentials' | 'credentialsToAccept'>,
): Promise<void> => {
  const {openId4VcIssuanceProvider, selectedCredentials, credentialsToAccept} = context;

  if (!openId4VcIssuanceProvider?.serverMetadata) {
    return Promise.reject(Error('OID4VCI issuance provider has no server metadata'));
  }

  const localeBranding: Array<IBasicCredentialLocaleBranding> | undefined = openId4VcIssuanceProvider?.credentialBranding?.get(
    selectedCredentials[0],
  );
  if (localeBranding && localeBranding.length > 0) {
    await addCredentialBranding({
      vcHash: computeEntryHash(credentialsToAccept[0].rawVerifiableCredential),
      issuerCorrelationId: new URL(openId4VcIssuanceProvider.serverMetadata.issuer).hostname,
      localeBranding,
    });
  }
};

export const storeCredentials = async (context: Pick<OID4VCIMachineContext, 'credentialsToAccept'>): Promise<void> => {
  const {credentialsToAccept} = context;
  store.dispatch<any>(storeVerifiableCredential(credentialsToAccept[0].rawVerifiableCredential));
};
