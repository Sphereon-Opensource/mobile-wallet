import {Json, SupportedVersion, VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {CheckLinkedDomain} from '@sphereon/did-auth-siop-adapter';
import {com} from '@sphereon/kmp-mdoc-core';
import {PresentationDefinitionV1, PresentationDefinitionV2} from '@sphereon/pex-models';
import {isOID4VCIssuerIdentifier, ManagedIdentifierOptsOrResult, ManagedIdentifierResult} from '@sphereon/ssi-sdk-ext.identifier-resolution';
import {encodeJoseBlob} from '@sphereon/ssi-sdk.core';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {ConnectionType, CredentialDocumentFormat, CredentialRole, DidAuthConfig} from '@sphereon/ssi-sdk.data-store';
import {DocumentType} from '@sphereon/ssi-sdk.data-store';
import {OID4VP, OpSession, VerifiableCredentialsWithDefinition, VerifiablePresentationWithDefinition, convertToDcqlCredentials} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {
  CredentialMapper,
  MdocDocument,
  OriginalVerifiableCredential,
  OriginalVerifiablePresentation,
  PresentationSubmission,
  SdJwtDecodedVerifiableCredential
} from '@sphereon/ssi-types' // FIXME we should fix the export of these objects // FIXME we should fix the export of these objects
import Debug, {Debugger} from 'debug';
import {EventEmitter} from 'events';
import {APP_ID} from '../../@config/constants';
import agent, {agentContext, didMethodsSupported, didResolver} from '../../agent';
import {generateDigest} from '../../utils';
import Oid4VPPresentationSubmission = com.sphereon.mdoc.oid4vp.Oid4VPPresentationSubmission;
import DeviceResponseCbor = com.sphereon.mdoc.data.device.DeviceResponseCbor;
import IssuerSignedCbor = com.sphereon.mdoc.data.device.IssuerSignedCbor;
import decodeFrom = com.sphereon.kmp.decodeFrom;
import Encoding = com.sphereon.kmp.Encoding;
import { DcqlPresentation, DcqlQuery } from 'dcql';

const debug: Debugger = Debug(`${APP_ID}:authentication`);

export const siopEventEmitter = new EventEmitter();

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
      eventEmitter: siopEventEmitter,
      hasher: generateDigest,
    },
    requestJwtOrUri,
  });
};

// FIX Funke START of temp code
const hasMDocCredentials = (credentialsAndDefinitions: VerifiableCredentialsWithDefinition[]): boolean => {
  return credentialsAndDefinitions.some(vcWithDef =>
    vcWithDef.credentials.some(
      credential =>
        (credential as UniqueDigitalCredential).digitalCredential.documentFormat === CredentialDocumentFormat.MSO_MDOC &&
        (credential as UniqueDigitalCredential).digitalCredential.documentType === DocumentType.VC,
    ),
  );
};

const isUniqueDigitalCredential = (credential: UniqueDigitalCredential | OriginalVerifiableCredential): credential is UniqueDigitalCredential => {
  return (credential as UniqueDigitalCredential).digitalCredential !== undefined;
};

const getDefinitionId = (definition: PresentationDefinitionV1 | PresentationDefinitionV2): string => {
  if ('id' in definition) {
    return definition.id;
  } else {
    throw new Error('Invalid presentation definition: missing id');
  }
};

// Outdated by OID4VP v1 spec
/*
const createMDocPresentation = async (
  vcWithDef: VerifiableCredentialsWithDefinition,
  identifier: ManagedIdentifierOptsOrResult,
  session: OpSession,
  request: VerifiedAuthorizationRequest,
): Promise<VerifiablePresentationWithDefinition> => {
  const presentationSubmission: Oid4VPPresentationSubmission = Oid4VPPresentationSubmission.Static.fromPresentationDefinition(
    // @ts-ignore FIXME
    vcWithDef.definition.definition,
  );
  const defId = presentationSubmission.definition_id;
  const dm = presentationSubmission.descriptor_map;
  const mDocCredentials: UniqueDigitalCredential[] = vcWithDef.credentials.filter(
    (credential): credential is UniqueDigitalCredential =>
      isUniqueDigitalCredential(credential) &&
      credential.digitalCredential.documentFormat === CredentialDocumentFormat.MSO_MDOC &&
      credential.digitalCredential.documentType === DocumentType.VC,
  );

  const originalCredentials: (OriginalVerifiableCredential | undefined)[] = mDocCredentials.map(
    credential => credential.originalVerifiableCredential,
  );

  const mdocs = originalCredentials.map(cred => IssuerSignedCbor.Static.cborDecode(decodeFrom(cred as string, Encoding.BASE64URL)).toDocument());
  const clientId = (await request.authorizationRequest.getMergedProperty<string>('client_id')) ?? request.issuer;
  if (!clientId) {
    return Promise.reject(Error('Could not get client_id from authorization request'));
  }
  const presentation = await agent.mdocOid4vpHolderPresent({
    mdocs: mdocs,
    presentationDefinition: vcWithDef.definition.definition as PresentationDefinitionV2,
    clientId,
    responseUri: request.responseURI!!,
    authorizationRequestNonce: (await request.authorizationRequest.getMergedProperty('nonce'))!!,
  });

  const presentations = [presentation.vp_token as OriginalVerifiablePresentation];

  return {
    definition: vcWithDef.definition,
    verifiableCredentials: originalCredentials.filter((cred): cred is OriginalVerifiableCredential => cred !== undefined),
    // @ts-ignore  FIXME Funke
    verifiablePresentations: presentations,
    idOpts: identifier,
    presentationSubmission: {
      id: presentationSubmission.id,
      definition_id: presentationSubmission.definition_id,
      descriptor_map: presentationSubmission.descriptor_map.map(descriptor => {
        return {
          id: descriptor.id,
          path: descriptor.path,
          format: descriptor.format,
        };
      }),
    },
  };
};
 */
// FIX Funke END of temp code

export const siopSendAuthorizationResponse = async (
  connectionType: ConnectionType,
  args: {
    sessionId: string;
    //verifiableCredentialsWithDefinition?: VerifiableCredentialsWithDefinition[];
    credentials: Array<UniqueDigitalCredential | OriginalVerifiableCredential>
  },
) => {
  if (connectionType !== ConnectionType.SIOPv2_OpenID4VP) {
    return Promise.reject(Error(`No supported authentication provider for type: ${connectionType}`));
  }
  const session: OpSession = await agent.siopGetOPSession({sessionId: args.sessionId});
  /*
    let identifiers: Array<IIdentifier> = await session.getSupportedIdentifiers();
    if (!identifiers || identifiers.length === 0) {
      throw Error(`No DID methods found in agent that are supported by the relying party`);
    }
  */
  const request = await session.getAuthorizationRequest();
  const aud = await request.authorizationRequest.getMergedProperty<string>('aud');
  console.log(`AUD: ${aud}`);
  console.log(JSON.stringify(request.authorizationRequest));
  /* const clientId = await request.authorizationRequest.getMergedProperty<string>('client_id');
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
 */
  // todo: This should be moved to code calling the sendAuthorizationResponse (this) method, as to allow the user to subselect and approve credentials!
  //let presentationsAndDefs: VerifiablePresentationWithDefinition[] | undefined;
  //fixme: make these next two lines unifrom. they should return the same type
  //let identifier: IIdentifier = identifiers[0];
  let managedIdentifier: ManagedIdentifierResult | undefined;
  //let presentationSubmission: PresentationSubmission | undefined;
  //if (await session.hasPresentationDefinitions()) {
    const oid4vp: OID4VP = await session.getOID4VP({hasher: generateDigest});

    // const credentialsAndDefinitions = args.verifiableCredentialsWithDefinition
    //   ? args.verifiableCredentialsWithDefinition
    //   : await oid4vp.filterCredentialsAgainstAllDefinitions(CredentialRole.HOLDER);
    const domain =
      ((await request.authorizationRequest.getMergedProperty('client_id')) as string) ??
      request.issuer ??
      (request.versions.includes(SupportedVersion.JWT_VC_PRESENTATION_PROFILE_v1)
        ? 'https://self-issued.me/v2/openid-vc'
        : 'https://self-issued.me/v2');
    debug(`NONCE: ${session.nonce}, domain: ${domain}`);

    /*

        const firstUniqueDC = credentialsAndDefinitions[0].credentials[0] as UniqueDigitalCredential;
        const firstVC = firstUniqueDC.uniformVerifiableCredential;
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
          managedIdentifier = await session.context.agent.identifierManagedGet({identifier: holder});
        } catch (e) {
          debug(`Holder DID not found: ${holder}`);
        }
      }*/

    const firstUniqueDC = args.credentials[0]//credentialsAndDefinitions[0].credentials[0];
    // FIXME Funke EBSI needs to be fixed

    if (!firstUniqueDC) {
      return Promise.reject(Error('SiopMachine could not determine a credential'));
    }

    if (typeof firstUniqueDC !== 'object' || !('digitalCredential' in firstUniqueDC)) {
      return Promise.reject(Error('SiopMachine only supports UniqueDigitalCredentials for now'));
    }

    let identifier: ManagedIdentifierOptsOrResult;
    const digitalCredential = firstUniqueDC.digitalCredential;
    const firstVC = firstUniqueDC.uniformVerifiableCredential;
    const holder = CredentialMapper.isSdJwtDecodedCredential(firstVC)
      ? firstVC.decodedPayload.cnf?.jwk
        ? //TODO SDK-19: convert the JWK to hex and search for the appropriate key and associated DID
          //doesn't apply to did:jwk only, as you can represent any DID key as a JWK. So whenever you encounter a JWK it doesn't mean it had to come from a did:jwk in the system. It just can always be represented as a did:jwk
          `did:jwk:${encodeJoseBlob(firstVC.decodedPayload.cnf?.jwk)}#0`
        : firstVC.decodedPayload.sub
      : Array.isArray(firstVC.credentialSubject)
      ? firstVC.credentialSubject[0].id
      : firstVC.credentialSubject.id;
    if (!digitalCredential.kmsKeyRef) {
      // In case the store does not have the kmsKeyRef lets search for the holder

      if (!holder) {
        return Promise.reject(`No holder found and no kmsKeyRef in DB. Cannot determine identifier to use`);
      }
      try {
        identifier = await session.context.agent.identifierManagedGet({identifier: holder});
      } catch (e) {
        debug(`Holder DID not found: ${holder}`);
        throw e;
      }
    } else if (isOID4VCIssuerIdentifier(digitalCredential.kmsKeyRef)) {
      identifier = await session.context.agent.identifierManagedGetByOID4VCIssuer({
        identifier: firstUniqueDC.digitalCredential.kmsKeyRef,
      });
    } else {
      switch (digitalCredential.subjectCorrelationType) {
        case 'DID':
          identifier = await session.context.agent.identifierManagedGetByDid({
            identifier: digitalCredential.subjectCorrelationId ?? holder,
            kmsKeyRef: digitalCredential.kmsKeyRef,
          });
          break;
        // TODO other implementations?
        default:
          if (digitalCredential.subjectCorrelationId?.startsWith('did:') || holder?.startsWith('did:')) {
            identifier = await session.context.agent.identifierManagedGetByDid({
              identifier: digitalCredential.subjectCorrelationId ?? holder,
              kmsKeyRef: digitalCredential.kmsKeyRef,
            });
          } else {
            // Since we are using the kmsKeyRef we will find the KID regardless of the identifier. We set it for later access though
            identifier = await session.context.agent.identifierManagedGetByKid({
              identifier: digitalCredential.subjectCorrelationId ?? holder ?? digitalCredential.kmsKeyRef,
              kmsKeyRef: digitalCredential.kmsKeyRef,
            });
          }
      }
    }
    //console.log(`Identifier`, identifier);

    // if (hasMDocCredentials(credentialsAndDefinitions)) {
    //   // FIXME Funke We need mdoc support inside the PEX library, after done this needs to be removed
    //   presentationsAndDefs = await Promise.all(
    //     credentialsAndDefinitions.map((vcWithDef: VerifiableCredentialsWithDefinition) =>
    //       createMDocPresentation(vcWithDef, identifier, session, request),
    //     ),
    //   );
    // } else {
    //   const authRequest = await session.getAuthorizationRequest();
    //   const vpFormats = authRequest.registrationMetadataPayload?.vp_formats;
    //   presentationsAndDefs = await oid4vp.createVerifiablePresentations(CredentialRole.HOLDER, credentialsAndDefinitions, {
    //     idOpts: identifier,
    //     proofOpts: {
    //       nonce: session.nonce,
    //       domain,
    //     },
    //     restrictToFormats: vpFormats,
    //   });
    //   console.log(presentationsAndDefs);
    // }
    // if (!presentationsAndDefs || presentationsAndDefs.length === 0) {
    //   throw Error('No verifiable presentations could be created');
    // } else if (presentationsAndDefs.length > 1) {
    //   throw Error(`Only one verifiable presentation supported for now. Got ${presentationsAndDefs.length}`);
    // }

    //managedIdentifier = await agentContext.agent.identifierManagedGet(presentationsAndDefs[0].idOpts);
    // presentationSubmission = presentationsAndDefs[0].presentationSubmission;

    /*const key = await getKey({identifier, vmRelationship: 'authentication'}, session.context);
    const kmsKeyRef = key.kid;
    const kid = managedIdentifier?.kid;*/

    const dcqlCredentialsWithCredentials = new Map(
     args.credentials.map((vc) => [convertToDcqlCredentials(vc), vc])
    )

    const queryResult = DcqlQuery.query(request.dcqlQuery, Array.from(dcqlCredentialsWithCredentials.keys()))

  const presentation: DcqlPresentation.Output = {}
  const uniqueCredentials = Array.from(dcqlCredentialsWithCredentials.values())
  for (const [key, value] of Object.entries(queryResult.credential_matches)) {
    if (value.success) {
      const matchedCredentials = value.valid_credentials.map(cred => uniqueCredentials[cred.input_credential_index])
      const vc = matchedCredentials[0] // taking the first match for now //uniqueCredentials[value.input_credential_index]
      if (!vc) {
        continue
      }
      const originalVc = retrieveEncodedCredential(vc as UniqueDigitalCredential) // TODO this is not nice // also always a UniqueDigitalCredential
      if (!originalVc) {
        continue
      }
      if (originalVc) {
        presentation[key] = originalVc as | string | { [x: string]: Json }
      }
    }
  }

  const dcqlPresentation = DcqlPresentation.parse(presentation)
  debug(`Presentation:`, JSON.stringify(dcqlPresentation, null, 2));

  const response = session.sendAuthorizationResponse({
    responseSignerOpts: identifier,
    //...{ dcqlQuery: { dcqlPresentation: DcqlPresentation.parse(presentation) } }, // TODO hmm a presentation is not a dcql query?
    dcqlResponse: {
      dcqlPresentation
    }
  })

    // debug(`Definitions and locations:`, JSON.stringify(presentationsAndDefs?.[0]?.verifiablePresentations, null, 2));
    // debug(`Presentation Submission:`, JSON.stringify(presentationSubmission, null, 2));
    // const response = await session.sendAuthorizationResponse({
    //   ...(presentationsAndDefs && {verifiablePresentations: presentationsAndDefs?.flatMap(pd => pd.verifiablePresentations)}),
    //   ...(presentationSubmission && {presentationSubmission}),
    //   responseSignerOpts: identifier,
    // });

    debug(`Response: `, response);

    return response;
  //}

  //return undefined;
};

const retrieveEncodedCredential = (credential: UniqueDigitalCredential): OriginalVerifiableCredential | undefined => {
  return credential.originalVerifiableCredential !== undefined &&
  credential.originalVerifiableCredential !== null &&
  (credential?.originalVerifiableCredential as SdJwtDecodedVerifiableCredential)?.compactSdJwtVc !== undefined &&
  (credential?.originalVerifiableCredential as SdJwtDecodedVerifiableCredential)?.compactSdJwtVc !== null
    ? (credential.originalVerifiableCredential as SdJwtDecodedVerifiableCredential).compactSdJwtVc
    : credential.originalVerifiableCredential
}
