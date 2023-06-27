import {CheckLinkedDomain, VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {getKey} from "@sphereon/ssi-sdk-ext.did-utils";
import {ConnectionTypeEnum, IDidAuthConfig} from '@sphereon/ssi-sdk.data-store';
import {OpSession, VerifiableCredentialsWithDefinition, VerifiablePresentationWithDefinition} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {OID4VP} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth/dist/session/OID4VP'; // FIXME we should fix the export of these objects

import {IIdentifier} from '@veramo/core';
import Debug from 'debug';

import {APP_ID} from '../../@config/constants';
import agent, {didMethodsSupported} from '../../agent';

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
  if (await session.hasPresentationDefinitions()) {
    const oid4vp: OID4VP = await session.getOID4VP();
    const credentialsAndDefinitions = args.verifiableCredentialsWithDefinition
      ? args.verifiableCredentialsWithDefinition
      : await oid4vp.filterCredentialsAgainstAllDefinitions();
    presentationsAndDefs = await oid4vp.createVerifiablePresentations(credentialsAndDefinitions, {identifierOpts: {identifier}});
    if (!presentationsAndDefs || presentationsAndDefs.length === 0) {
      throw Error('No verifiable presentations could be created');
    }
    identifier = presentationsAndDefs[0].identifierOpts.identifier;
  }
  const kid: string = (await getKey(identifier, 'authentication', session.context)).kid;

  const response = session.sendAuthorizationResponse({
    verifiablePresentations: presentationsAndDefs?.map(pd => pd.verifiablePresentation),
    responseSignerOpts: {identifier, kid},
  });

  return await response;
};
