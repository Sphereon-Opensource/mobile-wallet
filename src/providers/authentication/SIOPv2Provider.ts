import {CheckLinkedDomain, SupportedVersion, VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {getIdentifier, getKey} from '@sphereon/ssi-sdk-ext.did-utils';
import {ConnectionTypeEnum, IDidAuthConfig} from '@sphereon/ssi-sdk.data-store';
import {OpSession, VerifiableCredentialsWithDefinition, VerifiablePresentationWithDefinition} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {OID4VP} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth/dist/session/OID4VP';
import {PresentationSubmission} from '@sphereon/ssi-types'; // FIXME we should fix the export of these objects
import {IIdentifier} from '@veramo/core';
import Debug from 'debug';

import {APP_ID} from '../../@config/constants';
import agent, {agentContext, didMethodsSupported, didResolver} from '../../agent';

const debug: Debug.Debugger = Debug(`${APP_ID}:authentication`);

export const siopGetRequest = async (config: IDidAuthConfig): Promise<VerifiedAuthorizationRequest> => {
  const session: OpSession = await siopGetSession(config.sessionId).catch(
    async () => await siopRegisterSession({requestJwtOrUri: config.redirectUrl, sessionId: config.sessionId}),
  );

  console.log(`session: ${JSON.stringify(session.id, null, 2)}`);
  const verifiedAuthorizationRequest = await session.getAuthorizationRequest();
  console.log('Request: ' + JSON.stringify(verifiedAuthorizationRequest, null, 2));
  return verifiedAuthorizationRequest;
};

export const siopGetSession = async (sessionId: string): Promise<OpSession> => {
  return agent.siopGetOPSession({sessionId});
};

export const siopRegisterSession = async ({requestJwtOrUri, sessionId}: {requestJwtOrUri: string; sessionId?: string}): Promise<OpSession> => {
  return agent.siopRegisterOPSession({
    sessionId,
    op: {
      checkLinkedDomains: CheckLinkedDomain.NEVER, // fixme: check whether it works and enable
      resolveOpts: {
        resolver: didResolver,
      },
      supportedDIDMethods: didMethodsSupported,
    },
    requestJwtOrUri,
  });
};

export const siopSendAuthorizationResponse = async (
  connectionType: ConnectionTypeEnum,
  args: {
    sessionId: string;
    verifiableCredentialsWithDefinition?: VerifiableCredentialsWithDefinition[];
  },
) => {
  if (connectionType !== ConnectionTypeEnum.SIOPv2_OpenID4VP) {
    return Promise.reject(Error(`No supported authentication provider for type: ${connectionType}`));
  }
  const session: OpSession = await agent.siopGetOPSession({sessionId: args.sessionId});
  const identifiers: Array<IIdentifier> = await session.getSupportedIdentifiers();
  if (!identifiers || identifiers.length === 0) {
    throw Error(`No DID methods found in agent that are supported by the relying party`);
  }

  // todo: This should be moved to code calling the sendAuthorizationResponse (this) method, as to allow the user to subselect and approve credentials!
  let presentationsAndDefs: VerifiablePresentationWithDefinition[] | undefined;
  let identifier: IIdentifier = identifiers[0];
  let presentationSubmission: PresentationSubmission | undefined;
  if (await session.hasPresentationDefinitions()) {
    const oid4vp: OID4VP = await session.getOID4VP();
    const request = await session.getAuthorizationRequest();
    const credentialsAndDefinitions = args.verifiableCredentialsWithDefinition
      ? args.verifiableCredentialsWithDefinition
      : await oid4vp.filterCredentialsAgainstAllDefinitions();
    const domain =
      ((await request.authorizationRequest.getMergedProperty('client_id')) as string) ??
      request.issuer ??
      (request.versions.includes(SupportedVersion.JWT_VC_PRESENTATION_PROFILE_v1)
        ? 'https://self-issued.me/v2/openid-vc'
        : 'https://self-issued.me/v2');
    debug(`NONCE: ${session.nonce}, domain: ${domain}`);
    presentationsAndDefs = await oid4vp.createVerifiablePresentations(credentialsAndDefinitions, {
      identifierOpts: {identifier},
      proofOpts: {
        nonce: session.nonce,
        domain,
      },
    });
    if (!presentationsAndDefs || presentationsAndDefs.length === 0) {
      throw Error('No verifiable presentations could be created');
    } else if (presentationsAndDefs.length > 1) {
      throw Error(`Only one verifiable presentation supported for now. Got ${presentationsAndDefs.length}`);
    }

    identifier = await getIdentifier(presentationsAndDefs[0].identifierOpts, agentContext);
    presentationSubmission = presentationsAndDefs[0].presentationSubmission;
  }
  const kid: string = (await getKey(identifier, 'authentication', session.context)).kid;

  debug(`Definitions and locations: ${JSON.stringify(presentationsAndDefs?.[0]?.verifiablePresentation, null, 2)}`);
  debug(`Presentation Submission: ${JSON.stringify(presentationSubmission, null, 2)}`);
  const response = session.sendAuthorizationResponse({
    verifiablePresentations: presentationsAndDefs?.map(pd => pd.verifiablePresentation),
    ...(presentationSubmission && {presentationSubmission}),
    responseSignerOpts: {identifier, kid},
  });

  return await response;
};
