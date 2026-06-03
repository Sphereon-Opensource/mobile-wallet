import {ClientMetadataOpts, VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {isOID4VCIssuerIdentifier, ManagedIdentifierOptsOrResult} from '@sphereon/ssi-sdk-ext.identifier-resolution';
import {encodeJoseBlob} from '@sphereon/ssi-sdk.core';
import {
  CorrelationIdentifierType,
  CredentialDocumentFormat,
  DidAuthConfig,
  ICredentialBranding,
  IdentityOrigin,
  NonPersistedIdentity,
  Party,
} from '@sphereon/ssi-sdk.data-store-types';
import {
  ActionType,
  CredentialMapper,
  CredentialRole,
  decodeMdocIssuerSigned,
  DefaultActionSubType,
  InitiatorType,
  Loggers,
  LogLevel,
  MdocOid4vpIssuerSigned,
  SubSystem,
  System,
} from '@sphereon/ssi-types';
import {Linking} from 'react-native';
import {sendDCApiResponse, sendDCApiError} from '../dcApiService';
import {URL} from 'react-native-url-polyfill';
import {v4 as uuidv4} from 'uuid';
import {DcqlPresentation, DcqlQuery} from 'dcql';
import {AuthorizationServerMetadata, CredentialIssuerMetadata} from '@sphereon/oid4vci-common';
import {IIdentifier, VerifiableCredential} from '@veramo/core';
import {toCredentialSummary} from '@sphereon/ui-components.credential-branding';
import agent, {agentContext} from '../../agent';
import {convertToDcqlCredentials, createVerifiablePresentationForFormat, PresentationBuilderContext} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {siopGetRequest} from '../../providers/authentication/SIOPv2Provider';
import store from '../../store';
import {addIdentity} from '../../store/actions/contact.actions';
import {storeActivityLogging} from '../../store/actions/logging.actions';
import {SiopV2AuthorizationRequestData, SiopV2MachineContext} from '../../types/machines/siopV2';
import {getCredentialIssuerContact, getCredentialSubjectContact, translateCorrelationIdToName} from '../../utils';
import {getContacts} from '../contactService';

const CLOCK_SKEW = 120;
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
  const uri: URL | undefined = url?.includes('://') ? new URL(url) : undefined;
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

type DcqlMdocClaim = {path: Array<string | number | null>; intent_to_retain?: boolean};

/**
 * Build a minimal ISO 18013-5 mdoc presentation definition from a DCQL credential query.
 *
 * OID4VP 1.0 is DCQL-only (no Presentation Exchange), but the mdoc holder-present primitive
 * (matchDocumentsAndDescriptors / createDeviceResponse) still drives selective disclosure from a
 * presentation definition. So we translate the DCQL claims query (`[namespace, element]` paths)
 * into an mdoc input descriptor with `$['namespace']['element']` field paths.
 */
const buildMdocPresentationDefinitionFromDcql = (credentialQuery: {id?: string; meta?: {doctype_value?: string}; claims?: Array<DcqlMdocClaim>}): object => {
  const doctype = credentialQuery?.meta?.doctype_value;
  const claims: Array<DcqlMdocClaim> = credentialQuery?.claims ?? [];
  const fields = claims
    .filter((claim) => Array.isArray(claim.path) && claim.path.length >= 2 && typeof claim.path[0] === 'string' && typeof claim.path[1] === 'string')
    .map((claim) => ({
      path: [`$['${claim.path[0]}']['${claim.path[1]}']`],
      intent_to_retain: claim.intent_to_retain ?? false,
    }));
  return {
    id: credentialQuery?.id ?? doctype ?? uuidv4(),
    input_descriptors: [
      {
        id: doctype ?? credentialQuery?.id,
        format: {mso_mdoc: {alg: ['ES256']}},
        constraints: {
          limit_disclosure: 'required',
          fields,
        },
      },
    ],
  };
};

export const sendResponse = async (
  context: Pick<SiopV2MachineContext, 'didAuthConfig' | 'authorizationRequestData' | 'selectedCredentials' | 'contact' | 'dcApiMode' | 'dcApiOrigin'>,
): Promise<Response> => {
  const {didAuthConfig, authorizationRequestData, selectedCredentials, contact} = context;

  if (didAuthConfig === undefined) {
    return Promise.reject(Error('Missing config in context'));
  }

  if (authorizationRequestData === undefined) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  const credentials = selectedCredentials;

  if (credentials.length === 0) {
    return Promise.reject(Error('No credentials selected or available for sharing'));
  }
  // Get session and request
  const session = await agent.siopGetOPSession({sessionId: didAuthConfig.sessionId});
  const request = await session.getAuthorizationRequest();
  const domain =
    ((await request.authorizationRequest.getMergedProperty('client_id')) as string) ?? request.issuer ?? 'https://self-issued.me/v2';

  logger.debug(`NONCE: ${session.nonce}, domain: ${domain}`);

  const firstUniqueDC = credentials[0];
  if (typeof firstUniqueDC !== 'object' || !('digitalCredential' in firstUniqueDC)) {
    return Promise.reject(Error('Mobile wallet only supports UniqueDigitalCredentials'));
  }

  let identifier: ManagedIdentifierOptsOrResult;
  const digitalCredential = firstUniqueDC.digitalCredential;
  const firstVC = firstUniqueDC.uniformVerifiableCredential;

  if (!firstVC) {
    return Promise.reject(Error('No uniform verifiable credential found'));
  }

  // Determine holder DID for identifier resolution
  let holder: string | undefined;
  if (CredentialMapper.isSdJwtDecodedCredential(firstVC)) {
    holder = firstVC.decodedPayload.cnf?.jwk ? `did:jwk:${encodeJoseBlob(firstVC.decodedPayload.cnf?.jwk)}#0` : firstVC.decodedPayload.sub;
  } else {
    holder = Array.isArray(firstVC.credentialSubject) ? firstVC.credentialSubject[0].id : firstVC.credentialSubject.id;
  }

  // Resolve identifier
  if (!digitalCredential.kmsKeyRef) {
    if (!holder) {
      return Promise.reject(Error('No holder found and no kmsKeyRef in DB. Cannot determine identifier to use'));
    }
    try {
      identifier = await agent.identifierManagedGet({identifier: holder});
    } catch (e) {
      logger.debug(`Holder DID not found: ${holder}`);
      throw e;
    }
  } else if (isOID4VCIssuerIdentifier(digitalCredential.kmsKeyRef)) {
    if (!digitalCredential.kmsKeyRef) {
      return Promise.reject(Error('kmsKeyRef is required for OID4VCI issuer identifier'));
    }
    identifier = await agent.identifierManagedGetByOID4VCIssuer({
      identifier: digitalCredential.kmsKeyRef,
    });
  } else {
    switch (digitalCredential.subjectCorrelationType) {
      case 'DID':
        identifier = await agent.identifierManagedGetByDid({
          identifier: digitalCredential.subjectCorrelationId ?? holder ?? '',
          kmsKeyRef: digitalCredential.kmsKeyRef,
        });
        break;
      default:
        identifier = await agent.identifierManagedGetByKid({
          identifier: digitalCredential.subjectCorrelationId ?? holder ?? digitalCredential.kmsKeyRef,
          kmsKeyRef: digitalCredential.kmsKeyRef,
        });
    }
  }

  const dcqlCredentialsWithCredentials = new Map(credentials.map((vc) => [convertToDcqlCredentials(vc), vc]));

  const queryResult = DcqlQuery.query(request.dcqlQuery, Array.from(dcqlCredentialsWithCredentials.keys()));

  if (!queryResult.can_be_satisfied) {
    return Promise.reject(Error('Credentials do not match required query request'));
  }

  // In DC API mode, the audience uses the origin: prefix per OID4VP DC API spec §A.3
  const audience = context.dcApiMode && context.dcApiOrigin ? `origin:${context.dcApiOrigin}` : domain;
  if (context.dcApiMode) {
    logger.info(`DC API mode active. Audience: ${audience}, origin: ${context.dcApiOrigin}`);
  }

  // Build presentation context for format-aware VP creation
  const presentationContext: PresentationBuilderContext = {
    nonce: request.requestObject?.getPayload()?.nonce ?? session.nonce,
    audience,
    agent: agent,
    clockSkew: CLOCK_SKEW,
  };

  // Build DCQL presentation with format-aware VPs
  const presentation: DcqlPresentation.Output = {};
  const uniqueCredentials = Array.from(dcqlCredentialsWithCredentials.values());

  for (const [key, value] of Object.entries(queryResult.credential_matches)) {
    if (value.success) {
      const matchedCredentials = value.valid_credentials.map((cred) => uniqueCredentials[cred.input_credential_index]);
      const vc = matchedCredentials[0];

      if (!vc) {
        continue;
      }

      // Look up the credential query to extract DCQL claims for selective disclosure
      const credentialQuery = request.dcqlQuery.credentials.find((c) => c.id === key);
      const validCredential = value.valid_credentials[0];
      const validClaimIndexes = validCredential?.claims?.valid_claim_sets?.[0]?.valid_claim_indexes;
      logger.debug(`DCQL credential query '${key}': claims=${JSON.stringify(credentialQuery?.claims)}, validClaimIndexes=${JSON.stringify(validClaimIndexes)}`);

      const perCredentialContext: PresentationBuilderContext = {
        ...presentationContext,
        ...(credentialQuery?.claims
          ? {
              dcqlClaims: credentialQuery.claims as Array<{path: Array<string | number | null>; id?: string; values?: Array<string | number | boolean>}>,
              ...(validClaimIndexes ? {dcqlValidClaimIndexes: [...validClaimIndexes]} : {}),
            }
          : {}),
      };

      try {
        const isMdoc = typeof vc === 'object' && 'digitalCredential' in vc && vc.digitalCredential.documentFormat === CredentialDocumentFormat.MSO_MDOC;
        if (isMdoc) {
          // OID4VP 1.0 mdoc: build a device-signed DeviceResponse, driven by the DCQL claims query (no Presentation Exchange).
          // NOTE: the underlying kmp-mdoc-core still emits the draft OID4VPHandover (clientIdHash/responseUriHash/mdoc_generated_nonce),
          // not the OID4VP 1.0 `OpenID4VPHandover`. Device auth may therefore not verify at a strict 1.0 verifier until kmp-mdoc-core is updated.
          if (!request.responseURI) {
            throw Error('Missing response_uri for mdoc presentation');
          }
          const mdocPresentationDefinition = buildMdocPresentationDefinitionFromDcql(credentialQuery as any);
          const decodedMdoc = decodeMdocIssuerSigned(vc.originalVerifiableCredential as MdocOid4vpIssuerSigned);
          const mdocResult = await agent.mdocOid4vpHolderPresent({
            mdocs: [decodedMdoc],
            presentationDefinition: mdocPresentationDefinition as any,
            mdocHolderNonce: uuidv4(),
            authorizationRequestNonce: presentationContext.nonce,
            responseUri: request.responseURI,
            clientId: domain,
          });
          // OID4VP 1.0 DCQL: the mdoc vp_token entry is an array of base64url DeviceResponse(s).
          presentation[key] = [mdocResult.vp_token] as any;
          logger.debug(`mdoc VP for '${key}': ${mdocResult.vp_token.substring(0, 120)}...`);
        } else {
          const vp = await createVerifiablePresentationForFormat(vc, identifier, perCredentialContext);
          logger.debug(`VP for '${key}': ${typeof vp === 'string' ? vp.substring(0, 120) + '...' : JSON.stringify(vp).substring(0, 120) + '...'}`);
          presentation[key] = vp as any;
        }
      } catch (error) {
        logger.error(`Failed to create VP for credential ${key}:`, error);
        throw error;
      }
    }
  }

  const dcqlPresentation = DcqlPresentation.parse(presentation);

  // In DC API mode, return the VP response via the native bridge instead of HTTP
  if (context.dcApiMode) {
    const responseJson = JSON.stringify({vp_token: dcqlPresentation});
    logger.info(`DC API mode: sending response via native bridge (${responseJson.length} chars)`);
    logger.debug(`DC API response (first 300 chars): ${responseJson.substring(0, 300)}`);
    sendDCApiResponse(responseJson);

    // Log activity for each credential (same as normal flow below)
    for (const credential of selectedCredentials) {
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
          description: 'Credential shared via DC API',
          actionType: ActionType.READ,
          actionSubType: DefaultActionSubType.VC_SHARE,
          correlationId: didAuthConfig.sessionId,
          // @ts-ignore
          credentialType: credential.digitalCredential.documentFormat,
          credentialHash: credential.hash,
          originalCredential: JSON.stringify(credential.digitalCredential),
          data: {
            credential: credentialSummary,
          },
          // @ts-ignore
          partyCorrelationType: contact?.identities[0].identifier.type,
          partyCorrelationId: contact?.identities[0].identifier.correlationId,
          partyAlias: contact?.contact.displayName,
        }),
      );
    }

    // Return a synthetic Response for the machine to handle
    return new Response(null, {status: 200}) as unknown as Response;
  }

  const response = await session.sendAuthorizationResponse({
    responseSignerOpts: identifier,
    dcqlResponse: {
      dcqlPresentation,
    },
  });

  // Log activity for each credential
  for (const credential of selectedCredentials) {
    let sharedClaims;

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
        // TODO
        //diagnosticData: authorizationRequestData.presentationDefinitions,
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

  // Handle redirect
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
    federation_entity: result.jwtPayload?.federation_entity,
    openid_wallet_provider: getMetadataField<AuthorizationServerMetadata>(result.jwtPayload?.metadata, 'openid_wallet_provider'),
    oauth_authorization_server: getMetadataField<AuthorizationServerMetadata>(result.jwtPayload?.metadata, 'oauth_authorization_server'),
    openid_credential_issuer: getMetadataField<CredentialIssuerMetadata>(result.jwtPayload?.metadata, 'openid_credential_issuer'),
    openid_credential_verifier: getMetadataField<ClientMetadataOpts>(result.jwtPayload?.metadata, 'openid_credential_verifier'),
  };
};

const getMetadataField = <T>(metadata: unknown, field: string): T | undefined => metadata && typeof metadata === 'object' && field in metadata
  ? (metadata as Record<string, unknown>)[field] as T
  : undefined;