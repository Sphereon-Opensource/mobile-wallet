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
import {addCredentialBranding, selectAppLocaleBranding} from '../../services/brandingService';
import {verifyCredential} from '../../services/credentialService';
import {getContacts} from '../../services/contactService';
import store from '../../store';
import {storeVerifiableCredential} from '../../store/actions/credential.actions';
import {addIdentity} from '../../store/actions/contact.actions';
import {ICredentialTypeSelection, IVerificationResult, MappedCredentialOffer, OID4VCIMachineContext, OID4VCIMachineEventTypes} from '../../types';

export const initiating = async (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): Promise<OpenId4VcIssuanceProvider> => {
  const {requestData} = _ctx;
  return OpenId4VcIssuanceProvider.initiationFromUri({uri: requestData.uri});
};

export const createCredentialSelection = async (
  _ctx: OID4VCIMachineContext,
  _event: OID4VCIMachineEventTypes,
): Promise<Array<ICredentialTypeSelection>> => {
  const {openId4VcIssuanceProvider, selectedCredentials} = _ctx;

  if (!openId4VcIssuanceProvider) {
    return Promise.reject(Error('OpenId4VcIssuanceProvider not initiated'));
  }

  const credentialsSupported: Array<CredentialSupported> = openId4VcIssuanceProvider.credentialsSupported ?? [];
  const credentialSelection: Array<ICredentialTypeSelection> = await Promise.all(
    credentialsSupported.map(async (credentialMetadata: CredentialSupported): Promise<ICredentialTypeSelection> => {
      // FIXME this allows for duplicate VerifiableCredential, which the user has no idea which ones those are and we also have a branding map with unique keys, so some branding will not match
      const credentialType: string =
        credentialMetadata.types.find((type: string): boolean => type !== 'VerifiableCredential') ?? 'VerifiableCredential';
      return {
        id: uuidv4(),
        credentialType,
        credentialAlias:
          (await selectAppLocaleBranding({localeBranding: openId4VcIssuanceProvider.credentialBranding?.get(credentialType)}))?.alias ||
          credentialType,
        isSelected: false,
      };
    }),
  );

  // TODO find better place to do this
  if (credentialSelection.length === 1) {
    selectedCredentials.push(credentialSelection[0].credentialType);
  }

  return credentialSelection;
};

export const retrieveContact = async (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): Promise<IContact | undefined> => {
  const {openId4VcIssuanceProvider} = _ctx;
  // TODO fix null ref
  const correlationId: string = new URL(openId4VcIssuanceProvider!.serverMetadata!.issuer).hostname;
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

  // return _ctx.openId4VcIssuanceProvider!.getServerMetadataAndPerformCryptoMatching()
  //   .then((metadata: IServerMetadataAndCryptoMatchingResponse) => {
  //
  //     // TODO remove brackets
  //     return getContacts({
  //       filter: [
  //         {
  //           identities: {
  //             identifier: {
  //               correlationId: new URL(metadata.serverMetadata.issuer).hostname,
  //             },
  //           },
  //         },
  //       ],
  //     })
  //   }).then((contacts: Array<IContact>): IContact | undefined => {
  //     // TODO throw error if 0 or more than 1
  //     return contacts.length === 1 ? contacts[0] : undefined // TODO improve code
  //   })
};

export const retrieveCredentials = async (
  _ctx: OID4VCIMachineContext,
  _event: OID4VCIMachineEventTypes,
): Promise<Array<MappedCredentialOffer> | undefined> => {
  const {openId4VcIssuanceProvider, verificationCode, selectedCredentials} = _ctx;
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

export const addContactIdentity = async (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): Promise<void> => {
  const {credentialOffers, contact} = _ctx;
  const correlationId: string = credentialOffers[0].correlationId;
  const identity: IBasicIdentity = {
    alias: correlationId,
    roles: [IdentityRoleEnum.ISSUER],
    identifier: {
      type: CorrelationIdentifierEnum.DID,
      correlationId,
    },
  };
  store.dispatch<any>(addIdentity({contactId: contact!.id, identity}));
};

export const verifyCredentials = async (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): Promise<void> => {
  const {credentialOffers, verificationCode} = _ctx;

  await Promise.all(
    credentialOffers.map(async (offer: MappedCredentialOffer): Promise<void> => {
      const verificationResult: IVerificationResult = await verifyCredential({
        credential: offer.credentialOffer.credentialResponse.credential as VerifiableCredential | CompactJWT, //origVC as VerifiableCredential | CompactJWT,
        fetchRemoteContexts: true,
        policies: {
          credentialStatus: false,
          expirationDate: false,
          issuanceDate: false,
        },
      });

      if (!verificationResult.result || verificationResult.error) {
        return Promise.reject(Error(verificationResult.result ? verificationResult.error : 'verification error')); // TODO msg
      }
    }),
  );
};

export const storeCredentialBranding = async (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): Promise<void> => {
  const {openId4VcIssuanceProvider, selectedCredentials, credentialOffers} = _ctx;
  // TODO null refs
  const localeBranding: Array<IBasicCredentialLocaleBranding> | undefined = openId4VcIssuanceProvider!.credentialBranding!.get(
    selectedCredentials[0],
  );
  if (localeBranding && localeBranding?.length > 0) {
    // TODO add guard for this?
    await addCredentialBranding({
      vcHash: computeEntryHash(credentialOffers[0].rawVerifiableCredential),
      issuerCorrelationId: new URL(openId4VcIssuanceProvider!.serverMetadata!.issuer).hostname, // TODO fix, use actual issuerCorrelationId // null refs
      localeBranding,
    });
  }
};

export const storeCredentials = async (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): Promise<void> => {
  const {credentialOffers} = _ctx;
  store.dispatch<any>(storeVerifiableCredential(credentialOffers[0].rawVerifiableCredential)); // TODO void or await or nothing
};
