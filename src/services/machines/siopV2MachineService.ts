import {SupportedVersion, VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {
  ConnectionType,
  CorrelationIdentifierType,
  CredentialRole,
  DidAuthConfig,
  IdentityOrigin,
  NonPersistedIdentity,
  Party,
} from '@sphereon/ssi-sdk.data-store';
import {W3CVerifiableCredential} from '@sphereon/ssi-types';
import {Linking} from 'react-native';
import {URL} from 'react-native-url-polyfill';
import {v4 as uuidv4} from 'uuid';
import {agentContext} from '../../agent';
import {siopGetRequest, siopSendAuthorizationResponse} from '../../providers/authentication/SIOPv2Provider';
import store from '../../store';
import {addIdentity} from '../../store/actions/contact.actions';
import {SiopV2AuthorizationRequestData, SiopV2MachineContext} from '../../types/machines/siopV2';
import {translateCorrelationIdToName} from '../../utils';
import {getContacts} from '../contactService';
import {IIdentifier} from '@veramo/core';

export const createConfig = async (
  context: Pick<SiopV2MachineContext, 'url' | 'identifier'>,
): Promise<Omit<DidAuthConfig, 'stateId' | 'identifier'>> => {
  const {url, identifier} = context;

  if (!url) {
    return Promise.reject(Error('Missing request uri in context'));
  }

  return {
    idOpts: {
      identifier: identifier as IIdentifier,
    },
    id: uuidv4(),
    // FIXME: Update these values in SSI-SDK. Only the URI (not a redirectURI) would be available at this point
    sessionId: uuidv4(),
    redirectUrl: url,
  };
};

export const getSiopRequest = async (context: Pick<SiopV2MachineContext, 'didAuthConfig' | 'url'>): Promise<SiopV2AuthorizationRequestData> => {
  const {didAuthConfig} = context;

  if (context.url === undefined) {
    return Promise.reject(Error('Missing request uri in context'));
  }

  if (didAuthConfig === undefined) {
    return Promise.reject(Error('Missing config in context'));
  }

  const verifiedAuthorizationRequest: VerifiedAuthorizationRequest = await siopGetRequest(didAuthConfig);
  const name = verifiedAuthorizationRequest.registrationMetadataPayload?.client_name;
  const url =
    verifiedAuthorizationRequest.responseURI ??
    (context.url.includes('request_uri')
      ? decodeURIComponent(context.url.split('?request_uri=')[1].trim())
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
    name,
    clientId,
    presentationDefinitions:
      (await verifiedAuthorizationRequest.authorizationRequest.containsResponseType('vp_token')) ||
      (verifiedAuthorizationRequest.versions.every(version => version <= SupportedVersion.JWT_VC_PRESENTATION_PROFILE_v1) &&
        verifiedAuthorizationRequest.presentationDefinitions &&
        verifiedAuthorizationRequest.presentationDefinitions.length > 0)
        ? verifiedAuthorizationRequest.presentationDefinitions
        : undefined,
  };
};

export const retrieveContact = async (context: Pick<SiopV2MachineContext, 'url' | 'authorizationRequestData'>): Promise<Party | undefined> => {
  const {authorizationRequestData} = context;

  if (authorizationRequestData === undefined) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  return getContacts(
    {
      filter: [
        {
          identities: {
            identifier: {
              correlationId: authorizationRequestData.correlationId,
            },
          },
        },
      ],
    },
    agentContext,
  ).then((contacts: Array<Party>): Party | undefined => (contacts.length === 1 ? contacts[0] : undefined));
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
    const identity: NonPersistedIdentity = {
      origin: IdentityOrigin.EXTERNAL,
      alias: correlationId,
      roles: [CredentialRole.VERIFIER],
      identifier: {
        type: CorrelationIdentifierType.DID,
        correlationId,
      },
    };
    return store.dispatch<any>(addIdentity({contactId: contact.id, identity}));
  }
};

export const sendResponse = async (
  context: Pick<SiopV2MachineContext, 'didAuthConfig' | 'authorizationRequestData' | 'selectedCredentials'>,
): Promise<Response> => {
  const {didAuthConfig, authorizationRequestData, selectedCredentials} = context;

  if (didAuthConfig === undefined) {
    return Promise.reject(Error('Missing config in context'));
  }

  if (authorizationRequestData === undefined) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  const response = await siopSendAuthorizationResponse(ConnectionType.SIOPv2_OpenID4VP, {
    sessionId: didAuthConfig.sessionId,
    ...(authorizationRequestData.presentationDefinitions !== undefined && {
      verifiableCredentialsWithDefinition: [
        {
          definition: authorizationRequestData.presentationDefinitions[0], // TODO 0 check, check siop only
          credentials: selectedCredentials as Array<W3CVerifiableCredential>,
        },
      ],
    }),
  });
  if (response.status === 302 && response.headers.has('location')) {
    const url = response.headers.get('location') as string;
    console.log(`Redirecting to: ${url}`);
    Linking.emit('url', {url});
  }

  return response;
};
