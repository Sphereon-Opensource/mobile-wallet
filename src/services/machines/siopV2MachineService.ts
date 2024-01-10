import {v4 as uuidv4} from 'uuid';
import {VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {
  ConnectionTypeEnum,
  CorrelationIdentifierEnum,
  IBasicIdentity,
  IContact,
  IdentityRoleEnum,
  IDidAuthConfig,
} from '@sphereon/ssi-sdk.data-store';
import {siopGetRequest, siopSendAuthorizationResponse} from '../../providers/authentication/SIOPv2Provider';
import {SiopV2AuthorizationRequestData, SiopV2MachineContext} from '../../types/machines/siopV2';
import {URL} from 'react-native-url-polyfill';
import {getContacts} from '../contactService';
import store from '../../store';
import {addIdentity} from '../../store/actions/contact.actions';
import {W3CVerifiableCredential} from '@sphereon/ssi-types';
import {IIdentifier} from '@veramo/core';
import {getOrCreatePrimaryIdentifier} from '../identityService';
import {translateCorrelationIdToName} from '../../utils/CredentialUtils';

export const createConfig = async (context: Pick<SiopV2MachineContext, 'requestData' | 'identifier'>): Promise<IDidAuthConfig> => {
  const {requestData} = context;

  if (requestData?.uri === undefined) {
    return Promise.reject(Error('Missing request uri in context'));
  }

  const identifier: IIdentifier = await getOrCreatePrimaryIdentifier();
  return {
    id: uuidv4(),
    // FIXME: Update these values in SSI-SDK. Only the URI (not a redirectURI) would be available at this point
    sessionId: uuidv4(),
    redirectUrl: requestData.uri,
    stateId: requestData.state,
    identifier,
  };
};

export const getSiopRequest = async (
  context: Pick<SiopV2MachineContext, 'didAuthConfig' | 'requestData'>,
): Promise<SiopV2AuthorizationRequestData> => {
  //VerifiedAuthorizationRequest // TODO getSiopRequest
  const {didAuthConfig, requestData} = context;

  if (requestData?.uri === undefined) {
    return Promise.reject(Error('Missing request uri in context'));
  }

  if (didAuthConfig === undefined) {
    return Promise.reject(Error('Missing config in context'));
  }

  const verifiedAuthorizationRequest: VerifiedAuthorizationRequest = await siopGetRequest(didAuthConfig);
  const name = verifiedAuthorizationRequest.registrationMetadataPayload?.registration?.client_name;
  const url =
    verifiedAuthorizationRequest.responseURI ??
    (requestData.uri.includes('request_uri')
      ? decodeURIComponent(requestData.uri.split('?request_uri=')[1].trim())
      : verifiedAuthorizationRequest.issuer ?? verifiedAuthorizationRequest.registrationMetadataPayload?.client_id);
  const uri: URL | undefined = url.includes('://') ? new URL(url) : undefined;
  const correlationIdName = uri
    ? translateCorrelationIdToName(uri.hostname)
    : verifiedAuthorizationRequest.issuer
    ? translateCorrelationIdToName(verifiedAuthorizationRequest.issuer.split('://')[1])
    : name;
  const correlationId: string = uri?.hostname ?? correlationIdName;
  const clientId: string | undefined = await verifiedAuthorizationRequest.authorizationRequest.getMergedProperty<string>('client_id');

  return {
    issuer: verifiedAuthorizationRequest.issuer,
    correlationId,
    registrationMetadataPayload: verifiedAuthorizationRequest.registrationMetadataPayload,
    uri,
    clientId,
    presentationDefinitions: verifiedAuthorizationRequest.presentationDefinitions,
  };
};

export const retrieveContact = async (
  context: Pick<SiopV2MachineContext, 'requestData' | 'authorizationRequestData'>,
): Promise<IContact | undefined> => {
  const {authorizationRequestData} = context;

  if (authorizationRequestData === undefined) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  return getContacts({
    filter: [
      {
        identities: {
          identifier: {
            correlationId: authorizationRequestData.correlationId,
          },
        },
      },
    ],
  }).then((contacts: Array<IContact>): IContact | undefined => (contacts.length === 1 ? contacts[0] : undefined));
};

export const addContactIdentity = async (context: Pick<SiopV2MachineContext, 'contact' | 'authorizationRequestData'>): Promise<void> => {
  const {contact, authorizationRequestData} = context;

  if (contact === undefined) {
    return Promise.reject(Error('Missing contact in context'));
  }

  if (authorizationRequestData === undefined) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  // TODO: Makes sense to move these types of common queries/retrievals to the SIOP auth request object
  const clientId: string | undefined = authorizationRequestData.clientId ?? authorizationRequestData.issuer;
  const correlationId: string | undefined = clientId
    ? clientId.startsWith('did:')
      ? clientId
      : `${new URL(clientId).protocol}//${new URL(clientId).hostname}`
    : undefined;

  if (correlationId) {
    const identity: IBasicIdentity = {
      alias: correlationId,
      roles: [IdentityRoleEnum.ISSUER],
      identifier: {
        type: CorrelationIdentifierEnum.DID,
        correlationId,
      },
    };
    return store.dispatch<any>(addIdentity({contactId: contact.id, identity}));
  }
};

export const sendResponse = async (
  context: Pick<SiopV2MachineContext, 'didAuthConfig' | 'authorizationRequestData' | 'selectedCredentials'>,
): Promise<void> => {
  const {didAuthConfig, authorizationRequestData, selectedCredentials} = context;

  if (didAuthConfig === undefined) {
    return Promise.reject(Error('Missing config in context'));
  }

  if (authorizationRequestData === undefined) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  await siopSendAuthorizationResponse(ConnectionTypeEnum.SIOPv2_OpenID4VP, {
    sessionId: didAuthConfig.sessionId,
    verifiableCredentialsWithDefinition: [
      {
        definition: authorizationRequestData.presentationDefinitions![0], // TODO 0 check, check siop only
        credentials: selectedCredentials as Array<W3CVerifiableCredential>,
      },
    ],
  });
};
