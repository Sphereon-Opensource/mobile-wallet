import {URL} from 'react-native-url-polyfill';
import {v4 as uuidv4} from 'uuid';
import {CompactJWT, VerifiableCredential} from '@veramo/core';
import {computeEntryHash} from '@veramo/utils';
import {CodeChallengeMethod, CredentialResponse, CredentialSupported, GrantTypes, ResponseType} from '@sphereon/oid4vci-common';
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
import {IAuthenticationOpts, ICredentialTypeSelection, IVerificationResult, QrTypesEnum} from '../../types/';
import {MappedCredentialOffer, OID4VCIMachineContext} from '../../types/machines/oid4vci';
import {translate} from '../../localization/Localization';
import {getTypesFromCredentialSupported} from '@sphereon/oid4vci-common/lib/functions/IssuerMetadataUtils';
import {getRandomBytes} from 'expo-crypto';
import {AuthorizationRequest, AuthorizationRequestState, IssuerConnection} from '../../types/service/authenticationService';
import {sha256} from '@noble/hashes/sha256';
import {Linking} from 'react-native';
import {base64UrlEncode} from '../../utils/TextUtils';

const CODE_VERIFIER_LENGTH = 128;
const NONCE_LENGTH = 32;

export const initiateOpenId4VcIssuanceProvider = async (context: Pick<OID4VCIMachineContext, 'requestData'>): Promise<OpenId4VcIssuanceProvider> => {
  const {requestData} = context;

  if (requestData == undefined || requestData.type === undefined) {
    return Promise.reject(Error('Missing request context'));
  }

  switch (requestData.type) {
    case QrTypesEnum.OPENID_INITIATE_ISSUANCE:
    case QrTypesEnum.OPENID_CREDENTIAL_OFFER:
      if (requestData.uri === undefined) {
        return Promise.reject(Error('Missing request uri in context'));
      }
      return OpenId4VcIssuanceProvider.initiationFromUri({uri: requestData.uri});

    case QrTypesEnum.OPENID_CONNECT_ISSUER:
      const issuerConnection = requestData.issuerConnection as IssuerConnection;
      if (issuerConnection == undefined) {
        throw new Error('Could not get issuerConnection from QR data');
      }
      const issuerUrl = new URL(issuerConnection.issuerUrl);
      return OpenId4VcIssuanceProvider.initiationFromIssuer({
        issuer: `${issuerUrl.protocol}//${issuerUrl.host}`,
        clientId: issuerConnection.clientId,
      });
  }
  return Promise.reject(Error(`Can't initiate OpenId4VcIssuanceProvider for request type ${requestData.type}`));
};

const generateRandomString = (length: number) => {
  return base64UrlEncode(getRandomBytes(length)).slice(0, length);
};

function determineScope(credentialsSupported: CredentialSupported[], selectedCredentials: Array<string>) {
  let scope: string | undefined;
  credentialsSupported
    .filter(credentialSupported => credentialSupported.scope != undefined)
    .map(credentialSupported => {
      const types = getTypesFromCredentialSupported(credentialSupported);
      if (types.some(type => selectedCredentials.includes(type))) {
        scope = credentialSupported.scope!;
      }
    });
  return scope;
}

export const authorizeInteractive = async (
  context: Pick<OID4VCIMachineContext, 'requestData' | 'openId4VcIssuanceProvider' | 'selectedCredentials'>,
): Promise<AuthorizationRequestState> => {
  const {requestData, openId4VcIssuanceProvider, selectedCredentials} = context;
  if (!requestData || !requestData.issuerConnection) {
    return Promise.reject(Error('Could not get issuerConnection from QR data'));
  }
  if (!openId4VcIssuanceProvider || !openId4VcIssuanceProvider.serverMetadata) {
    return Promise.reject(Error('Could not get serverMetadata'));
  }
  if (!openId4VcIssuanceProvider.serverMetadata.authorization_endpoint) {
    return Promise.reject(Error('Could not get authorization_endpoint'));
  }
  if (!selectedCredentials || selectedCredentials.length == 0) {
    // (This also implies that credentialIssuerMetadata.credentials_supported is defined)
    return Promise.reject(Error(`Can't determine scope, no credential(s) selected`));
  }
  const issuerConnection = requestData.issuerConnection as IssuerConnection;
  const codeVerifier = generateRandomString(CODE_VERIFIER_LENGTH);
  const codeChallenge = base64UrlEncode(sha256(codeVerifier));
  const authRequest = {
    scope:
      determineScope(openId4VcIssuanceProvider.serverMetadata!.credentialIssuerMetadata?.credentials_supported!, selectedCredentials) ?? 'openid',
    response_type: ResponseType.AUTH_CODE,
    client_id: issuerConnection.clientId,
    redirect_uri: issuerConnection.redirectUri,
    nonce: generateRandomString(NONCE_LENGTH),
    code_challenge: codeChallenge,
    code_challenge_method: CodeChallengeMethod.SHA256,
  } as AuthorizationRequest;

  const queryParams = new URLSearchParams(authRequest);
  const url = `${openId4VcIssuanceProvider.serverMetadata.authorization_endpoint}?${queryParams}`;
  await Linking.openURL(url);

  return {
    authorizationRequest: authRequest,
    codeVerifier,
  } as AuthorizationRequestState;
};

export const createCredentialSelection = async (
  context: Pick<OID4VCIMachineContext, 'openId4VcIssuanceProvider' | 'selectedCredentials'>,
): Promise<Array<ICredentialTypeSelection>> => {
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
      const types = getTypesFromCredentialSupported(credentialMetadata);
      const credentialType: string = types.find((type: string): boolean => type !== 'VerifiableCredential') ?? 'VerifiableCredential';
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

export const retrieveContact = async (context: Pick<OID4VCIMachineContext, 'openId4VcIssuanceProvider'>): Promise<IContact | undefined> => {
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

export const retrieveCredentialOffers = async (
  context: Pick<
    OID4VCIMachineContext,
    | 'openId4VcIssuanceProvider'
    | 'verificationCode'
    | 'selectedCredentials'
    | 'requestData'
    | 'authorizationRequestState'
    | 'authorizationCodeResponse'
  >,
): Promise<Array<MappedCredentialOffer> | undefined> => {
  const {openId4VcIssuanceProvider, verificationCode, selectedCredentials, requestData, authorizationRequestState, authorizationCodeResponse} =
    context;

  let grantType: GrantTypes;
  let authenticationOptions: IAuthenticationOpts;
  if (requestData?.type === QrTypesEnum.OPENID_CONNECT_ISSUER) {
    // FIXME requestData?.type is maybe not the nicest way to keep determining the flow
    if (authorizationCodeResponse?.code == undefined) {
      return Promise.reject(Error(`code is missing from the authorization response`));
    }
    const issuerConnection = requestData?.issuerConnection as IssuerConnection;
    authenticationOptions = {
      pin: verificationCode,
      clientId: issuerConnection.clientId,
      redirectUri: issuerConnection.redirectUri,
      tokenProxyUrl: issuerConnection.proxyTokenUrl,
      code: authorizationCodeResponse?.code,
      codeVerifier: authorizationRequestState?.codeVerifier,
    };
    grantType = GrantTypes.AUTHORIZATION_CODE;
  } else {
    authenticationOptions = {
      pin: verificationCode,
    };
    grantType = GrantTypes.PRE_AUTHORIZED_CODE;
  }

  return openId4VcIssuanceProvider
    ?.getCredentialsFromIssuance({
      credentials: selectedCredentials,
      authenticationOptions: authenticationOptions,
      grantType: grantType,
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

export const addContactIdentity = async (context: Pick<OID4VCIMachineContext, 'credentialOffers' | 'contact'>): Promise<void> => {
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

export const assertValidCredentials = async (context: Pick<OID4VCIMachineContext, 'credentialOffers'>): Promise<void> => {
  const {credentialOffers} = context;

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

export const storeCredentialBranding = async (
  context: Pick<OID4VCIMachineContext, 'openId4VcIssuanceProvider' | 'selectedCredentials' | 'credentialOffers'>,
): Promise<void> => {
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

export const storeCredentials = async (context: Pick<OID4VCIMachineContext, 'credentialOffers'>): Promise<void> => {
  const {credentialOffers} = context;
  store.dispatch<any>(storeVerifiableCredential(credentialOffers[0].rawVerifiableCredential));
};
