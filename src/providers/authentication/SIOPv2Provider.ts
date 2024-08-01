import {CheckLinkedDomain, SupportedVersion, VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {determineKid, getIdentifier, getKey} from '@sphereon/ssi-sdk-ext.did-utils';
import {ConnectionType, CredentialRole, DidAuthConfig} from '@sphereon/ssi-sdk.data-store';
import {OID4VP, OpSession, VerifiableCredentialsWithDefinition, VerifiablePresentationWithDefinition} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {CredentialMapper, PresentationSubmission} from '@sphereon/ssi-types'; // FIXME we should fix the export of these objects
import {IIdentifier} from '@veramo/core';
import Debug, {Debugger} from 'debug';

import {APP_ID} from '../../@config/constants';
import agent, {agentContext, didMethodsSupported, didResolver} from '../../agent';
import {getOrCreatePrimaryIdentifier} from '../../services/identityService';
import {SupportedDidMethodEnum} from '../../types';
import {generateDigest} from '../../utils';
import {encodeJoseBlob} from '@veramo/utils';

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
  connectionType: ConnectionType,
  args: {
    sessionId: string;
    verifiableCredentialsWithDefinition?: VerifiableCredentialsWithDefinition[];
  },
) => {
  if (connectionType !== ConnectionType.SIOPv2_OpenID4VP) {
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
  if (clientId?.toLowerCase().includes('.ebsi.eu') || redirectUri?.toLowerCase().includes('.ebsi.eu')) {
    identifiers = identifiers.filter(id => id.did.toLowerCase().startsWith('did:key:') || id.did.toLowerCase().startsWith('did:ebsi:'));
    if (identifiers.length === 0) {
      debug(`No EBSI key present yet. Creating a new one...`);
      const identifier = await getOrCreatePrimaryIdentifier(
        {
          method: SupportedDidMethodEnum.DID_KEY,
          createOpts: {options: {codecName: 'jwk_jcs-pub', type: 'Secp256r1'}},
        },
        agentContext,
      );
      debug(`EBSI key created: ${identifier.did}`);
      identifiers = [identifier];
    }
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
    const oid4vp: OID4VP = await session.getOID4VP({hasher: generateDigest});

    const credentialsAndDefinitions = args.verifiableCredentialsWithDefinition
      ? args.verifiableCredentialsWithDefinition
      : await oid4vp.filterCredentialsAgainstAllDefinitions(CredentialRole.HOLDER);
    const domain =
      ((await request.authorizationRequest.getMergedProperty('client_id')) as string) ??
      request.issuer ??
      (request.versions.includes(SupportedVersion.JWT_VC_PRESENTATION_PROFILE_v1)
        ? 'https://self-issued.me/v2/openid-vc'
        : 'https://self-issued.me/v2');
    debug(`NONCE: ${session.nonce}, domain: ${domain}`);

    const firstVC = CredentialMapper.toUniformCredential(credentialsAndDefinitions[0].credentials[0], {hasher: generateDigest});
    const holder = CredentialMapper.isSdJwtDecodedCredential(firstVC)
      ? firstVC.decodedPayload.cnf?.jwk
        ? //TODO SDK-19: convert the JWK to hex and search for the appropriate key and associated DID
          //doesn't apply to did:jwk only, as you can represent any DID key as a JWK. So whenever you encounter a JWK it doesn't mean it had to come from a did:jwk in the system. It just can always be represented as a did:jwk
          `did:jwk:${encodeJoseBlob(firstVC.decodedPayload.cnf?.jwk)}#0`
        : firstVC.decodedPayload.sub
      : Array.isArray(firstVC.credentialSubject)
      ? firstVC.credentialSubject[0].id
      : firstVC.credentialSubject.id;
    if (holder) {
      try {
        identifier = await session.context.agent.didManagerGet({did: holder});
      } catch (e) {
        debug(`Holder DID not found: ${holder}`);
      }
    }

    presentationsAndDefs = await oid4vp.createVerifiablePresentations(CredentialRole.HOLDER, credentialsAndDefinitions, {
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
  const key = await getKey({identifier, vmRelationship: 'authentication'}, session.context);
  const kmsKeyRef = key.kid;
  const kid = await determineKid({key, idOpts: {identifier, kmsKeyRef, verificationMethodSection: 'authentication'}}, session.context);

  debug(`Definitions and locations:`, JSON.stringify(presentationsAndDefs?.[0]?.verifiablePresentation, null, 2));
  debug(`Presentation Submission:`, JSON.stringify(presentationSubmission, null, 2));
  const response = session.sendAuthorizationResponse({
    ...(presentationsAndDefs && {verifiablePresentations: presentationsAndDefs?.map(pd => pd.verifiablePresentation)}),
    ...(presentationSubmission && {presentationSubmission}),
    responseSignerOpts: {identifier, kmsKeyRef, kid},
  });
  debug(`Response: `, response);

  return await response;
};
