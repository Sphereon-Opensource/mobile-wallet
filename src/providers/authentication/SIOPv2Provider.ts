import {CheckLinkedDomain, SupportedVersion, VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {getIdentifier, getKey} from '@sphereon/ssi-sdk-ext.did-utils';
import {ConnectionTypeEnum, DidAuthConfig} from '@sphereon/ssi-sdk.data-store';
import {OpSession, VerifiableCredentialsWithDefinition, VerifiablePresentationWithDefinition, OID4VP} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {CredentialMapper, PresentationSubmission} from '@sphereon/ssi-types'; // FIXME we should fix the export of these objects
import {IIdentifier} from '@veramo/core';
import Debug, {Debugger} from 'debug';

import {APP_ID} from '../../@config/constants';
import agent, {agentContext, didMethodsSupported, didResolver} from '../../agent';

const debug: Debugger = Debug(`${APP_ID}:authentication`);

export const siopGetRequest = async (config: Omit<DidAuthConfig, 'identifier'>): Promise<VerifiedAuthorizationRequest> => {
  const session: OpSession = await siopGetSession(config.sessionId).catch(
    async () => await siopRegisterSession({requestJwtOrUri: config.redirectUrl, sessionId: config.sessionId}),
  );

  debug(`session: ${JSON.stringify(session.id, null, 2)}`);
  const verifiedAuthorizationRequest = await session.getAuthorizationRequest();
  debug('Request: ' + JSON.stringify(verifiedAuthorizationRequest, null, 2));
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
  let identifiers: Array<IIdentifier> = await session.getSupportedIdentifiers();
  if (!identifiers || identifiers.length === 0) {
    throw Error(`No DID methods found in agent that are supported by the relying party`);
  }
  const request = await session.getAuthorizationRequest();
  const aud = await request.authorizationRequest.getMergedProperty<string>('aud');
  console.log(`AUD: ${aud}`);
  console.log(JSON.stringify(request.authorizationRequest));
  const clientId = await request.authorizationRequest.getMergedProperty<string>('client_id');
  const redirectUri = await request.authorizationRequest.getMergedProperty<string>('redirect_uri');
  if (clientId?.toLowerCase().includes('ebsi.eu') || redirectUri?.toLowerCase().includes('ebsi.eu')) {
    identifiers = identifiers.filter(id => id.did.toLowerCase().startsWith('did:key:') || id.did.toLowerCase().startsWith('did:ebsi:'));
  }
  if (aud && aud.startsWith('did:')) {
    // The RP knows our did, so we can use it
    if (!identifiers.some(id => id.did === aud)) {
      throw Error(`The aud DID ${aud} is not in the supported identifiers ${identifiers.map(id => id.did)}`);
    }
    identifiers = [identifiers.find(id => id.did === aud) as IIdentifier];
  }

  // todo: This should be moved to code calling the sendAuthorizationResponse (this) method, as to allow the user to subselect and approve credentials!
  let presentationsAndDefs: VerifiablePresentationWithDefinition[] | undefined;
  let identifier: IIdentifier = identifiers[0];
  let presentationSubmission: PresentationSubmission | undefined;
  if (await session.hasPresentationDefinitions()) {
    const oid4vp: OID4VP = await session.getOID4VP();

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

    const firstVC = CredentialMapper.toUniformCredential(credentialsAndDefinitions[0].credentials[0]);
    const holder = Array.isArray(firstVC.credentialSubject) ? firstVC.credentialSubject[0].id : firstVC.credentialSubject.id;
    if (holder) {
      try {
        identifier = await session.context.agent.didManagerGet({did: holder});
      } catch (e) {
        debug(`Holder DID not found: ${holder}`);
      }
    }

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

  debug(`Definitions and locations:`, JSON.stringify(presentationsAndDefs?.[0]?.verifiablePresentation, null, 2));
  debug(`Presentation Submission:`, JSON.stringify(presentationSubmission, null, 2));
  const response = session.sendAuthorizationResponse({
    ...(presentationsAndDefs && {verifiablePresentations: presentationsAndDefs?.map(pd => pd.verifiablePresentation)}),
    ...(presentationSubmission && {presentationSubmission}),
    responseSignerOpts: {identifier, kid},
  });
  debug(`Response: `, response);

  return await response;
};
