import {
  CreateConfigResult,
  OpSession,
  Siopv2AuthorizationRequestData,
  Siopv2AuthorizationResponseData,
  VerifiableCredentialsWithDefinition,
} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {v4 as uuidv4} from 'uuid';
import {siopSendAuthorizationResponse} from '../../providers/authentication/SIOPv2Provider';
import {FunkeC2ShareMachineContext} from '../../types/machines/funkeC2ShareMachine';
import agent from '../../agent';
import {decodeUriAsJson, SupportedVersion} from '@sphereon/did-auth-siop';
import {generateDigest, translateCorrelationIdToName} from '../../utils';
import {ConnectionType, Party} from '@sphereon/ssi-sdk.data-store';
import {MappedCredential} from '../../types/machines/getPIDCredentialMachine';
import {CredentialMapper, W3CVerifiableCredential} from '@sphereon/ssi-types';
import {PEX, Status} from '@sphereon/pex';

export const siopCreateConfig = async (context: Pick<FunkeC2ShareMachineContext, 'url'>): Promise<CreateConfigResult> => {
  const {url} = context;

  if (!url) {
    return Promise.reject(Error('Missing request uri in context'));
  }

  return {
    id: uuidv4(),
    // FIXME: Update these values in SSI-SDK. Only the URI (not a redirectURI) would be available at this point
    sessionId: uuidv4(),
    redirectUrl: url,
  };
};

export const siopGetSiopRequest = async (
  context: Pick<FunkeC2ShareMachineContext, 'didAuthConfig' | 'url'>,
): Promise<Siopv2AuthorizationRequestData> => {
  const {didAuthConfig} = context;

  if (context.url === undefined) {
    return Promise.reject(Error('Missing request uri in context'));
  }

  if (didAuthConfig === undefined) {
    return Promise.reject(Error('Missing config in context'));
  }
  const {sessionId, redirectUrl} = didAuthConfig;

  const session: OpSession = await agent
    .siopGetOPSession({sessionId})
    .catch(async () => await agent.siopRegisterOPSession({requestJwtOrUri: redirectUrl, sessionId}));

  //logger.debug(`session: ${JSON.stringify(session.id, null, 2)}`)
  const verifiedAuthorizationRequest = await session.getAuthorizationRequest();
  // logger.trace('Request: ' + JSON.stringify(verifiedAuthorizationRequest, null, 2))
  const clientName = verifiedAuthorizationRequest.registrationMetadataPayload?.client_name;
  const url =
    verifiedAuthorizationRequest.responseURI ??
    (context.url.includes('request_uri')
      ? decodeURIComponent(context.url.split('?request_uri=')[1].trim())
      : verifiedAuthorizationRequest.issuer ?? verifiedAuthorizationRequest.registrationMetadataPayload?.client_id);
  const uri: URL | undefined = url.includes('://') ? new URL(url) : undefined;
  const correlationId: string = uri?.hostname ?? (await determineCorrelationId(uri, verifiedAuthorizationRequest, clientName));
  const clientId: string | undefined = await verifiedAuthorizationRequest.authorizationRequest.getMergedProperty<string>('client_id');

  return {
    issuer: verifiedAuthorizationRequest.issuer,
    correlationId,
    registrationMetadataPayload: verifiedAuthorizationRequest.registrationMetadataPayload,
    uri,
    name: clientName,
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

export const siopRetrieveContact = async (
  context: Pick<FunkeC2ShareMachineContext, 'url' | 'authorizationRequestData'>,
): Promise<Party | undefined> => {
  const {authorizationRequestData} = context;

  if (authorizationRequestData === undefined) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  return agent
    .cmGetContacts({
      filter: [
        {
          identities: {
            identifier: {
              correlationId: authorizationRequestData.correlationId,
            },
          },
        },
      ],
    })
    .then((contacts: Array<Party>): Party | undefined => (contacts.length === 1 ? contacts[0] : undefined));
};

export const retrievePIDCredentials = async (context: Pick<FunkeC2ShareMachineContext, 'funkeProvider'>): Promise<Array<MappedCredential>> => {
  const {funkeProvider} = context;

  if (!funkeProvider?.refreshUrl) {
    return Promise.reject(Error('Missing ausweis refresh url in context'));
  }

  return funkeProvider
    .getAuthorizationCode()
    .then((authorizationCode: string) => funkeProvider.getPids({authorizationCode}))
    .then(pidResponses => {
      return pidResponses.map(pidResponse => {
        const credential = pidResponse.credential;
        const identifier = pidResponse.identifier;
        const rawCredential = typeof credential === 'string' ? credential : JSON.stringify(credential);
        const uniformCredential = CredentialMapper.toUniformCredential(rawCredential, {hasher: generateDigest});

        return {
          uniformCredential,
          rawCredential,
          identifier,
        };
      });
    });
};

export const siopSendResponse = async (
  context: Pick<FunkeC2ShareMachineContext, 'didAuthConfig' | 'authorizationRequestData' | 'pidCredentials' | 'idOpts'>,
): Promise<Siopv2AuthorizationResponseData> => {
  const {didAuthConfig, authorizationRequestData, pidCredentials} = context;

  if (didAuthConfig === undefined) {
    return Promise.reject(Error('Missing config in context'));
  }

  if (authorizationRequestData === undefined) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  const pex = new PEX();
  const verifiableCredentialsWithDefinition: Array<VerifiableCredentialsWithDefinition> = [];

  authorizationRequestData.presentationDefinitions?.forEach(presentationDefinition => {
    const {areRequiredCredentialsPresent, verifiableCredential} = pex.selectFrom(presentationDefinition.definition, pidCredentials); // TODO
    if (areRequiredCredentialsPresent !== Status.ERROR) {
      verifiableCredentialsWithDefinition.push({
        definition: presentationDefinition,
        credentials: verifiableCredential as Array<W3CVerifiableCredential>,
      });
    }
  });

  const response = await siopSendAuthorizationResponse(ConnectionType.SIOPv2_OpenID4VP, {
    sessionId: didAuthConfig.sessionId,
    ...(context.idOpts && {idOpts: context.idOpts}),
    ...(authorizationRequestData.presentationDefinitions !== undefined && {verifiableCredentialsWithDefinition}),
  });
  if (!response) {
    return Promise.reject(Error('Missing SIOP authentication response'));
  }
  const contentType = response.headers.get('content-type') || '';
  let responseBody: any = null;

  const text = await response.text();
  if (text) {
    responseBody = contentType.includes('application/json') || text.startsWith('{') ? JSON.parse(text) : text;
  }

  return {
    body: responseBody,
    url: response.url,
    queryParams: decodeUriAsJson(response.url),
  };
};

const determineCorrelationId = async (uri: URL | undefined, verifiedAuthorizationRequest: any, clientName: string | undefined): Promise<string> => {
  if (uri) {
    return (await translateCorrelationIdToName(uri.hostname)) ?? uri.hostname;
  }

  if (verifiedAuthorizationRequest.issuer) {
    const issuerHostname = verifiedAuthorizationRequest.issuer.split('://')[1];
    return (await translateCorrelationIdToName(issuerHostname)) ?? issuerHostname;
  }

  if (clientName) {
    return clientName;
  }

  throw new Error("Can't determine correlationId from request");
};
