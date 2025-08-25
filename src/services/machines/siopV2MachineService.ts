import {SupportedVersion, VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {
  ConnectionType,
  CorrelationIdentifierType,
  CredentialDocumentFormat,
  CredentialRole,
  DidAuthConfig,
  ICredentialBranding,
  IdentityOrigin,
  NonPersistedIdentity,
  Party,
} from '@sphereon/ssi-sdk.data-store';
import {Linking} from 'react-native';
import {URL} from 'react-native-url-polyfill';
import {v4 as uuidv4} from 'uuid';
import agent, {agentContext} from '../../agent';
import {siopGetRequest, siopSendAuthorizationResponse} from '../../providers/authentication/SIOPv2Provider';
import store from '../../store';
import {addIdentity} from '../../store/actions/contact.actions';
import {SiopV2AuthorizationRequestData, SiopV2MachineContext} from '../../types/machines/siopV2';
import {generateDigest, getCredentialIssuerContact, getCredentialSubjectContact, translateCorrelationIdToName} from '../../utils';
import {getContacts} from '../contactService';
import {IIdentifier, VerifiableCredential} from '@veramo/core';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {
  ActionType,
  CredentialMapper,
  decodeMdocIssuerSigned,
  DefaultActionSubType,
  getMdocDecodedPayload,
  InitiatorType,
  Loggers,
  LogLevel,
  MdocOid4vpIssuerSigned,
  SubSystem,
  System,
} from '@sphereon/ssi-types';
import {storeActivityLogging} from '../../store/actions/logging.actions';
import {PEX, SelectResults} from '@sphereon/pex';
import {com} from '@sphereon/kmp-mdoc-core';
import IOid4VPPresentationDefinition = com.sphereon.mdoc.oid4vp.IOid4VPPresentationDefinition;
import {toCredentialSummary} from '@sphereon/ui-components.credential-branding';

const logger = Loggers.DEFAULT.get('sphereon:siopV2MachineService');

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
  const correlationId: string | undefined = uri?.hostname ?? correlationIdName;

  if (!correlationId) {
    return Promise.reject(Error('Unable to determine correlation id'));
  }

  const clientIdScheme: string | undefined = verifiedAuthorizationRequest.authorizationRequest.getMergedProperty<string>('client_id_scheme');
  const clientId: string | undefined = verifiedAuthorizationRequest.authorizationRequest.getMergedProperty<string>('client_id');
  const entityId: string | undefined = verifiedAuthorizationRequest.authorizationRequest.getMergedProperty<string>('entity_id');

  return {
    issuer: verifiedAuthorizationRequest.issuer,
    correlationId,
    registrationMetadataPayload: verifiedAuthorizationRequest.registrationMetadataPayload,
    uri,
    name,
    clientIdScheme,
    clientId,
    entityId,
    dcqlQuery: verifiedAuthorizationRequest.dcqlQuery,
    // presentationDefinitions:
    //   (await verifiedAuthorizationRequest.authorizationRequest.containsResponseType('vp_token')) ||
    //   (verifiedAuthorizationRequest.versions.every(version => version <= SupportedVersion.JWT_VC_PRESENTATION_PROFILE_v1) &&
    //     verifiedAuthorizationRequest.presentationDefinitions &&
    //     verifiedAuthorizationRequest.presentationDefinitions.length > 0)
    //     ? verifiedAuthorizationRequest.presentationDefinitions
    //     : undefined,
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
  context: Pick<SiopV2MachineContext, 'didAuthConfig' | 'authorizationRequestData' | 'selectedCredentials' | 'contact'>,
): Promise<Response> => {
  const {didAuthConfig, authorizationRequestData, selectedCredentials, contact} = context;

  if (didAuthConfig === undefined) {
    return Promise.reject(Error('Missing config in context'));
  }

  if (authorizationRequestData === undefined) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  const response = await siopSendAuthorizationResponse(ConnectionType.SIOPv2_OpenID4VP, {
    sessionId: didAuthConfig.sessionId,
    credentials: selectedCredentials,
    // ...(authorizationRequestData.presentationDefinitions !== undefined && {
    //   verifiableCredentialsWithDefinition: [
    //     {
    //       definition: authorizationRequestData.presentationDefinitions[0], // TODO 0 check, check siop only
    //       credentials: selectedCredentials as Array<UniqueDigitalCredential>,
    //     },
    //   ],
    // }),
  });

  // const pd = authorizationRequestData.presentationDefinitions?.[0].definition;
  // const pex: PEX = new PEX({hasher: generateDigest});
  for (const credential of selectedCredentials) {
    let sharedClaims;
    // if (pd) {
    //   if (credential.digitalCredential.documentFormat === CredentialDocumentFormat.MSO_MDOC) {
    //     const decodedMdoc = decodeMdocIssuerSigned(credential.originalVerifiableCredential as MdocOid4vpIssuerSigned);
    //     const limitDisclosedMdoc = decodedMdoc.limitDisclosureFromPresentationDefinition(pd as IOid4VPPresentationDefinition);
    //     sharedClaims = getMdocDecodedPayload(limitDisclosedMdoc);
    //   } else {
    //     const result: SelectResults = pex.selectFrom(pd, [credential.originalVerifiableCredential!]);
    //     const credentialSubject = CredentialMapper.toUniformCredential(result.verifiableCredential![0], {hasher: generateDigest}).credentialSubject;
    //     sharedClaims = Array.isArray(credentialSubject) ? credentialSubject[0] : credentialSubject;
    //   }
    // }

    const credentialsBranding: Array<ICredentialBranding> = await agent.ibGetCredentialBranding({filter: [{vcHash: credential.hash}]});
    const uniform = JSON.parse(credential.digitalCredential.uniformDocument) as VerifiableCredential;
    const issuer: Party | undefined = getCredentialIssuerContact(uniform as VerifiableCredential);
    const credentialSummary = await toCredentialSummary({
      verifiableCredential: uniform as VerifiableCredential,
      hash: credential.hash,
      credentialRole: credential.digitalCredential.credentialRole,
      branding: credentialsBranding[0]?.localeBranding,
      issuer,
      subject: getCredentialSubjectContact(uniform as VerifiableCredential),
    });

    store.dispatch<any>(
      storeActivityLogging({
        level: LogLevel.INFO,
        system: System.OID4VP,
        subSystemType: SubSystem.OID4VP_OP,
        initiatorType: InitiatorType.SYSTEM,
        description: 'Credential shared by user',
        actionType: ActionType.READ,
        actionSubType: DefaultActionSubType.VC_SHARE,
        correlationId: didAuthConfig.sessionId,
        // FIXME we need the verifier info from the OID4VP v1 spec implementation to get the purpose (no pd as dcql is now used)
        //sharePurpose: pd?.purpose,
        // @ts-ignore
        credentialType: credential.digitalCredential.documentFormat, // TODO fix types
        credentialHash: credential.hash,
        originalCredential: JSON.stringify(credential.digitalCredential),
        diagnosticData: authorizationRequestData.presentationDefinitions,
        data: {
          credential: credentialSummary,
          sharedClaims,
        },
        // @ts-ignore
        partyCorrelationType: contact?.identities[0].identifier.type, // TODO fix types
        partyCorrelationId: contact?.identities[0].identifier.correlationId,
        partyAlias: contact?.contact.displayName,
      }),
    );
  }

  if (!response) {
    return Promise.reject(Error('Missing SIOP authentication response'));
  }
  if (response.status === 302 && response.headers.has('location')) {
    const url = response.headers.get('location') as string;
    console.log(`Redirecting to: ${url}`);
    await Linking.openURL(url);
  } else if (response.status >= 200 && response.status < 300) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body: Record<string, unknown> = await response.json();
      const redirectUri = body['redirect_uri'];
      if (typeof redirectUri === 'string') {
        logger.info(`Redirecting to: ${redirectUri}`);
        await Linking.openURL(redirectUri);
      }
    }
  }

  return response;
};

export const getFederationTrust = async (
  context: Pick<SiopV2MachineContext, 'url' | 'authorizationRequestData' | 'trustAnchors'>,
): Promise<
  Pick<
    SiopV2MachineContext,
    | 'trustedAnchors'
    | 'federation_entity'
    | 'oauth_authorization_server'
    | 'openid_wallet_provider'
    | 'openid_credential_verifier'
    | 'openid_credential_issuer'
  >
> => {
  const {authorizationRequestData, trustAnchors} = context;

  if (trustAnchors.length === 0) {
    return Promise.reject(Error('No trust anchors found'));
  }

  if (!authorizationRequestData) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  const entityIdentifier = authorizationRequestData.entityId;
  if (!entityIdentifier) {
    return Promise.reject(Error('Unable to determine entity identifier to resolve trust chain'));
  }
  const result = await agent.identifierExternalResolveByOIDFEntityId({
    method: 'entity_id',
    trustAnchors: trustAnchors,
    identifier: entityIdentifier,
  });
  return {
    trustedAnchors: result.trustedAnchors,
    federation_entity: result.jwtPayload.federation_entity,
    openid_wallet_provider: result.jwtPayload.metadata.openid_wallet_provider,
    oauth_authorization_server: result.jwtPayload.metadata.oauth_authorization_server,
    openid_credential_issuer: result.jwtPayload.metadata.openid_credential_issuer,
    openid_credential_verifier: result.jwtPayload.metadata.openid_credential_verifier,
  };
};
