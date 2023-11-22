import {URL} from 'react-native-url-polyfill';
import {v4 as uuidv4} from 'uuid';
import {CompactJWT, VerifiableCredential} from '@veramo/core';
import {computeEntryHash} from '@veramo/utils';
import {CredentialResponse, CredentialSupported} from '@sphereon/oid4vci-common';
import {CorrelationIdentifierEnum, IBasicCredentialLocaleBranding, IBasicIdentity, IContact, IdentityRoleEnum} from '@sphereon/ssi-sdk.data-store';
import {
  CredentialMapper,
  IIssuer,
  IVerifiableCredential,
  OriginalVerifiableCredential,
  W3CVerifiableCredential,
  WrappedVerifiableCredential,
} from '@sphereon/ssi-types';
import OpenId4VcIssuanceProvider, {CredentialFromOffer} from '../../providers/credential/OpenId4VcIssuanceProvider';
import {addCredentialBranding, selectAppLocaleBranding} from '../brandingService';
import {verifyCredential} from '../credentialService';
import {getContacts} from '../contactService';
import store from '../../store';
import {storeVerifiableCredential} from '../../store/actions/credential.actions';
import {addIdentity} from '../../store/actions/contact.actions';
import {ICredentialTypeSelection, IVerificationResult} from '../../types/';
import {MappedCredentialOffer, OID4VCIMachineContext} from '../../types/machines/oid4vci';
import {translate} from '../../localization/Localization';

export const initiateOpenId4VcIssuanceProvider = async (context: OID4VCIMachineContext): Promise<OpenId4VcIssuanceProvider> => {
  const {requestData} = context;

  if (requestData?.uri === undefined) {
    return Promise.reject(Error('Missing request uri in context'));
  }

  return OpenId4VcIssuanceProvider.initiationFromUri({uri: requestData.uri});
};

export const createCredentialSelection = async (context: OID4VCIMachineContext): Promise<Array<ICredentialTypeSelection>> => {
  const {openId4VcIssuanceProvider, selectedCredentials} = context;

  if (!openId4VcIssuanceProvider) {
    return Promise.reject(Error('Missing OpenId4VcIssuanceProvider in context'));
  }

  if (!openId4VcIssuanceProvider.credentialsSupported) {
    return Promise.reject(Error('OID4VCI issuance provider has no supported credentials'));
  }

  const credentialSelection: Array<ICredentialTypeSelection> = await Promise.all(
    openId4VcIssuanceProvider.credentialsSupported.map(async (credentialMetadata: CredentialSupported): Promise<ICredentialTypeSelection> => {
      // FIXME this allows for duplicate VerifiableCredential, which the user has no idea which ones those are and we also have a branding map with unique keys, so some branding will not match
      const credentialType: string =
        credentialMetadata.types.find((type: string): boolean => type !== 'VerifiableCredential') ?? 'VerifiableCredential';
      return {
        id: uuidv4(),
        credentialType,
        credentialAlias:
          (await selectAppLocaleBranding({localeBranding: openId4VcIssuanceProvider?.credentialBranding?.get(credentialType)}))?.alias ||
          credentialType,
        isSelected: false,
      };
    }),
  );

  // TODO find better place to do this, would be nice if the machine does this?
  if (credentialSelection.length === 1) {
    selectedCredentials.push(credentialSelection[0].credentialType);
  }

  return credentialSelection;
};

export const retrieveContact = async (context: OID4VCIMachineContext): Promise<IContact | undefined> => {
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
  }).then((contacts: Array<IContact>): IContact | undefined => (contacts.length === 1 ? contacts[0] : undefined));
};

export const retrieveCredentialOffers = async (context: OID4VCIMachineContext): Promise<Array<MappedCredentialOffer> | undefined> => {
  const {openId4VcIssuanceProvider, verificationCode, selectedCredentials} = context;
  return openId4VcIssuanceProvider
    ?.getCredentialsFromIssuance({
      credentials: selectedCredentials,
      pin: verificationCode,
    })
    .then(
      (credentialOffers: Array<CredentialFromOffer>): Array<MappedCredentialOffer> =>
        credentialOffers.map((credentialOffer: CredentialFromOffer): MappedCredentialOffer => {
          const credentialResponse: CredentialResponse = credentialOffer.credentialResponse;
          const verifiableCredential: W3CVerifiableCredential | undefined = credentialResponse.credential;
          const wrappedVerifiableCredential: WrappedVerifiableCredential = CredentialMapper.toWrappedVerifiableCredential(
            verifiableCredential as OriginalVerifiableCredential,
          );
          const uniformVerifiableCredential: IVerifiableCredential = wrappedVerifiableCredential.credential;
          const rawVerifiableCredential: VerifiableCredential = credentialResponse.credential as unknown as VerifiableCredential;
          const correlationId: string =
            typeof uniformVerifiableCredential.issuer === 'string'
              ? uniformVerifiableCredential.issuer
              : (uniformVerifiableCredential.issuer as IIssuer).id;

          return {
            correlationId,
            credentialOffer,
            rawVerifiableCredential,
            uniformVerifiableCredential,
          };
        }),
    );
};

export const addContactIdentity = async (context: OID4VCIMachineContext): Promise<void> => {
  const {credentialOffers, contact} = context;

  if (!contact) {
    return Promise.reject(Error('Missing contact in context'));
  }

  if (credentialOffers === undefined || credentialOffers.length === 0) {
    return Promise.reject(Error('Missing credential offers in context'));
  }

  const correlationId: string = credentialOffers[0].correlationId;
  const identity: IBasicIdentity = {
    alias: correlationId,
    roles: [IdentityRoleEnum.ISSUER],
    identifier: {
      type: CorrelationIdentifierEnum.DID,
      correlationId,
    },
  };
  return store.dispatch<any>(addIdentity({contactId: contact.id, identity}));
};

export const assertValidCredentials = async (context: OID4VCIMachineContext): Promise<void> => {
  const {credentialOffers, verificationCode} = context;

  await Promise.all(
    credentialOffers.map(async (offer: MappedCredentialOffer): Promise<void> => {
      const verificationResult: IVerificationResult = await verifyCredential({
        credential: offer.credentialOffer.credentialResponse.credential as VerifiableCredential | CompactJWT,
        // TODO WAL-675 we might want to allow these types of options as part of the context, now we have state machines. Allows us to pre-determine whether these policies apply and whether remote context should be fetched
        fetchRemoteContexts: true,
        policies: {
          credentialStatus: false,
          expirationDate: false,
          issuanceDate: false,
        },
      });

      if (!verificationResult.result || verificationResult.error) {
        return Promise.reject(Error(verificationResult.result ? verificationResult.error : translate('credential_verification_failed_message')));
      }
    }),
  );
};

export const storeCredentialBranding = async (context: OID4VCIMachineContext): Promise<void> => {
  const {openId4VcIssuanceProvider, selectedCredentials, credentialOffers} = context;

  if (!openId4VcIssuanceProvider?.serverMetadata) {
    return Promise.reject(Error('OID4VCI issuance provider has no server metadata'));
  }

  const localeBranding: Array<IBasicCredentialLocaleBranding> | undefined = openId4VcIssuanceProvider?.credentialBranding?.get(
    selectedCredentials[0],
  );
  if (localeBranding && localeBranding.length > 0) {
    await addCredentialBranding({
      vcHash: computeEntryHash(credentialOffers[0].rawVerifiableCredential),
      issuerCorrelationId: new URL(openId4VcIssuanceProvider.serverMetadata.issuer).hostname,
      localeBranding,
    });
  }
};

export const storeCredentials = async (context: OID4VCIMachineContext): Promise<void> => {
  const {credentialOffers} = context;
  store.dispatch<any>(storeVerifiableCredential(credentialOffers[0].rawVerifiableCredential));
};
