import {
  CreateConfigResult,
  OpSession,
  Siopv2AuthorizationRequestData,
  Siopv2AuthorizationResponseData,
  VerifiableCredentialsWithDefinition,
} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {v4 as uuidv4} from 'uuid';
import {siopGetSession, siopRegisterSession, siopSendAuthorizationResponse} from '../../providers/authentication/SIOPv2Provider';
import {FunkeC2ShareMachineContext} from '../../types/machines/funkeC2ShareMachine';
import agent from '../../agent';
import {decodeUriAsJson, SupportedVersion} from '@sphereon/did-auth-siop';
import {
  generateDigest,
  getCredentialIssuerContact,
  getCredentialSubjectContact,
  translateCorrelationIdToName
} from '../../utils';
import {
  ConnectionType,
  CredentialCorrelationType,
  CredentialDocumentFormat,
  CredentialRole,
  ICredentialBranding,
  Party,
  RegulationType,
} from '@sphereon/ssi-sdk.data-store';
import {MappedCredential} from '../../types/machines/getPIDCredentialMachine';
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
  System
} from '@sphereon/ssi-types';
import {getMatchingPidCredentials} from '../pexService';
import {getVerifiableCredentialsFromStorage} from '../credentialService';
import store from '../../store';
import {deleteVerifiableCredential, getVerifiableCredentials} from '../../store/actions/credential.actions';
import {computeEntryHash} from '@veramo/utils';
import {Linking} from 'react-native';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {storeActivityLogging, storeAuditLogging} from '../../store/actions/logging.actions';
import {PartyCorrelationType} from '@sphereon/ssi-sdk.core';
import {PEX, SelectResults} from '@sphereon/pex';
import {com} from '@sphereon/kmp-mdoc-core';
import IOid4VPPresentationDefinition = com.sphereon.mdoc.oid4vp.IOid4VPPresentationDefinition;
import {VerifiableCredential} from '@veramo/core';
import {CredentialSummary, toCredentialSummary} from '@sphereon/ui-components.credential-branding';
import PersonalIdentificationDataBranding from '../../@config/branding/PersonalIdentificationDataBranding.json';

const logger = Loggers.DEFAULT.get('sphereon:funkeC2ShareMachineService');

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

  // FIXME the agent plugin has no support for a hasher yet, using the same as local siopv2 flow here for now
  // const session: OpSession = await agent
  //   .siopGetOPSession({sessionId})
  //   .catch(async () => await agent.siopRegisterOPSession({requestJwtOrUri: redirectUrl, sessionId}));
  const session: OpSession = await siopGetSession(sessionId).catch(async () => await siopRegisterSession({requestJwtOrUri: redirectUrl, sessionId}));

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
  context: Pick<FunkeC2ShareMachineContext, 'didAuthConfig' | 'authorizationRequestData' | 'pidCredentials' | 'idOpts' | 'contact'>,
): Promise<Siopv2AuthorizationResponseData> => {
  const {didAuthConfig, authorizationRequestData, pidCredentials, contact} = context;

  if (didAuthConfig === undefined) {
    return Promise.reject(Error('Missing config in context'));
  }

  if (authorizationRequestData === undefined) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  const verifiableCredentialsWithDefinition: Array<VerifiableCredentialsWithDefinition> = [];
  const sharedCredentials = new Map<string, UniqueDigitalCredential>();

  if (authorizationRequestData.presentationDefinitions) {
    for (const presentationDefinition of authorizationRequestData.presentationDefinitions) {
      const matchingCredentials = await getMatchingPidCredentials({
        presentationDefinitionWithLocation: presentationDefinition,
        pidCredentials,
        issuerCorrelationId: authorizationRequestData.correlationId,
      });

      if (matchingCredentials) {
        matchingCredentials.forEach(credential => {
          sharedCredentials.set(credential.hash, credential);
        });

        verifiableCredentialsWithDefinition.push({
          definition: presentationDefinition,
          credentials: matchingCredentials,
        });
      }
    }
  }

  const pd = authorizationRequestData.presentationDefinitions?.[0].definition
  const pex: PEX = new PEX({hasher: generateDigest});
  for (const credential of Array.from(sharedCredentials.values())) {
    let sharedClaims
    if (pd) {
      if (credential.digitalCredential.documentFormat === CredentialDocumentFormat.MSO_MDOC) {
        const decodedMdoc = decodeMdocIssuerSigned(credential.originalVerifiableCredential as MdocOid4vpIssuerSigned)
        const limitDisclosedMdoc = decodedMdoc.limitDisclosureFromPresentationDefinition(pd as IOid4VPPresentationDefinition)
        sharedClaims = getMdocDecodedPayload(limitDisclosedMdoc)
      } else {
        const result: SelectResults = pex.selectFrom(pd, [credential.originalVerifiableCredential!]);
        const credentialSubject = CredentialMapper.toUniformCredential(result.verifiableCredential![0], {hasher: generateDigest}).credentialSubject
        sharedClaims = Array.isArray(credentialSubject) ? credentialSubject[0] : credentialSubject
      }
    }

    const credentialsBranding: Array<ICredentialBranding> = await agent.ibGetCredentialBranding({filter: [ { vcHash: credential.hash  } ]});
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
          sharePurpose: pd?.purpose,
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
    )
  }

  console.log(
    `siopSendResponse siopSendAuthorizationResponse ${JSON.stringify({
      sessionId: didAuthConfig.sessionId,
      ...(context.idOpts && {idOpts: context.idOpts}),
      ...(authorizationRequestData.presentationDefinitions !== undefined && {verifiableCredentialsWithDefinition}),
    })}`,
  );

  let response: Response | undefined = undefined;
  try {
    response = await siopSendAuthorizationResponse(ConnectionType.SIOPv2_OpenID4VP, {
      sessionId: didAuthConfig.sessionId,
      ...(context.idOpts && {idOpts: context.idOpts}),
      ...(authorizationRequestData.presentationDefinitions !== undefined && {verifiableCredentialsWithDefinition}),
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
  if (!response) {
    return Promise.reject(Error('Missing SIOP authentication response'));
  }
  const contentType = response.headers.get('content-type') || '';
  let responseBody: any = null;

  const text = await response.text();
  if (text) {
    responseBody = contentType.includes('application/json') || text.startsWith('{') ? JSON.parse(text) : text;
  }
  if (responseBody) {
    const redirectUri = responseBody['redirect_uri']; // TODO move to separate machine step?
    if (typeof redirectUri === 'string') {
      logger.info(`Redirecting to: ${redirectUri}`);
      Linking.openURL(redirectUri);
    }
  }
  return {
    body: responseBody,
    url: response.url,
    queryParams: decodeUriAsJson(response.url),
  };
};

export const storePIDCredentials = async (context: Pick<FunkeC2ShareMachineContext, 'pidCredentials'>): Promise<void> => {
  const {pidCredentials} = context;

  await deletePIDCredentials();

  let parentId: string | undefined = undefined;
  let parentCredentialHash: string | undefined = undefined;
  for (const mappedCredential of pidCredentials) {
    const digitalCredential = await agent.crsAddCredential({
      credential: {
        parentId,
        regulationType: RegulationType.PID, // FIXME FUNKE
        rawDocument: mappedCredential.rawCredential,
        credentialRole: CredentialRole.HOLDER,
        credentialId: mappedCredential.uniformCredential.id ?? computeEntryHash(mappedCredential.rawCredential),
        kmsKeyRef: mappedCredential.identifier?.kmsKeyRef ?? 'FIXME',
        identifierMethod: mappedCredential.identifier?.method ?? 'jwk',
        issuerCorrelationId: 'https://demo.pid-issuer.bundesdruckerei.de',
        issuerCorrelationType: CredentialCorrelationType.X509_SAN,
      },
      opts: {hasher: generateDigest},
    });


    const uniform = JSON.parse(digitalCredential.uniformDocument) as VerifiableCredential;
    const issuer: Party | undefined = getCredentialIssuerContact(uniform as VerifiableCredential);
    const credentialSummary: CredentialSummary = await toCredentialSummary({
      verifiableCredential: uniform,
      hash: digitalCredential.hash,
      credentialRole: digitalCredential.credentialRole,
      branding: [PersonalIdentificationDataBranding],
      issuer,
      subject: getCredentialSubjectContact(uniform),
    });

    store.dispatch<any>(
      storeActivityLogging({
        level: LogLevel.INFO,
        system: System.OID4VCI,
        subSystemType: SubSystem.VC_ISSUER,
        initiatorType: InitiatorType.SYSTEM,
        description: 'storePIDCredentials function call',
        actionType: ActionType.CREATE,
        actionSubType: DefaultActionSubType.VC_ISSUE,
        diagnosticData: {digitalCredential},
        // @ts-ignore
        credentialType: digitalCredential.documentFormat, // TODO fix types
        credentialHash: digitalCredential.hash,
        parentCredentialHash,
        originalCredential: JSON.stringify(digitalCredential),
        data: {
          credential: credentialSummary
        },
        // @ts-ignore
        partyCorrelationType: PartyCorrelationType.URL,
        partyCorrelationId: 'https://demo.pid-issuer.bundesdruckerei.de',
        partyAlias: 'Bundesdruckerei GmbH',
      }),
    );

    if (!parentId) {
      parentId = digitalCredential.id;
      parentCredentialHash = digitalCredential.hash;
    }
  }
};

export const storeCredentialBranding = async (context: Pick<FunkeC2ShareMachineContext, 'pidCredentials'>): Promise<void> => {
  const {pidCredentials} = context;

  const storeCredentials = pidCredentials.map((mappedCredential: MappedCredential) =>
    agent.ibAddCredentialBranding({
      vcHash: computeEntryHash(mappedCredential.rawCredential),
      issuerCorrelationId: 'https://demo.pid-issuer.bundesdruckerei.de',
      localeBranding: [PersonalIdentificationDataBranding],
    }),
  );

  await Promise.all(storeCredentials);
};

export const fetchVerifiableCredentials = async (context: FunkeC2ShareMachineContext): Promise<void> => {
  store.dispatch<any>(getVerifiableCredentials());
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

const deletePIDCredentials = async (): Promise<void> => {
  const deleteCredentials = (await getVerifiableCredentialsFromStorage({regulationTypes: [RegulationType.PID], parentsOnly: false})).map(
    credential => {
      store.dispatch<any>(deleteVerifiableCredential(credential.hash)).then(() =>
        store.dispatch<any>(
          storeAuditLogging({
            level: LogLevel.INFO,
            system: System.CREDENTIALS,
            subSystemType: SubSystem.OID4VP_OP,
            initiatorType: InitiatorType.SYSTEM,
            description: 'Credential was deleted by user',
            actionType: ActionType.DELETE,
            actionSubType: DefaultActionSubType.VC_DELETE,
            diagnosticData: credential,
          }),
        ),
      );
    },
  );

  await Promise.all(deleteCredentials);
};

export const getFederationTrust = async (
  context: Pick<FunkeC2ShareMachineContext, 'url' | 'authorizationRequestData' | 'trustAnchors'>,
): Promise<Array<string>> => {
  const {authorizationRequestData, trustAnchors} = context;

  if (trustAnchors.length === 0) {
    return Promise.reject(Error('No trust anchors found'));
  }

  if (!authorizationRequestData) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  // const entityIdentifier = authorizationRequestData.entityId;
  //
  // if (!entityIdentifier) {
  //   return Promise.reject(Error('Unable to determine entity identifier to resolve trust chain'));
  // }

  // const trustedAnchors = [];
  // for (const trustAnchor of trustAnchors) {
  //   const resolveResult = await agent.resolveTrustChain({
  //     entityIdentifier,
  //     trustAnchors: [trustAnchor],
  //   });
  //
  //   if (Array.isArray(resolveResult) && resolveResult.length > 0) {
  //     trustedAnchors.push(trustAnchor);
  //   }
  // }

  return []; //trustedAnchors;
};
