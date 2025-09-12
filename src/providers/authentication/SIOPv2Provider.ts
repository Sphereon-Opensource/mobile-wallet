import {SupportedVersion, VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {CheckLinkedDomain} from '@sphereon/did-auth-siop-adapter';
import {isOID4VCIssuerIdentifier, ManagedIdentifierOptsOrResult} from '@sphereon/ssi-sdk-ext.identifier-resolution';
import {encodeJoseBlob} from '@sphereon/ssi-sdk.core';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {ConnectionType, DidAuthConfig} from '@sphereon/ssi-sdk.data-store';
import {
  OpSession,
  convertToDcqlCredentials,
} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth'
import {
  CredentialMapper,
  OriginalVerifiableCredential,
  SdJwtDecodedVerifiableCredential
} from '@sphereon/ssi-types' // FIXME we should fix the export of these objects // FIXME we should fix the export of these objects
import Debug, {Debugger} from 'debug';
import {EventEmitter} from 'events';
import {APP_ID} from '../../@config/constants';
import agent, {didMethodsSupported, didResolver} from '../../agent';
import {generateDigest} from '../../utils';
import {DcqlPresentation, DcqlQuery} from 'dcql';
import {
  PartialSdJwtDecodedVerifiableCredential,
  PartialSdJwtKbJwt
} from '@sphereon/pex/dist/main/lib'
import { calculateSdHash } from '@sphereon/pex/dist/main/lib/utils'

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
    credentials: Array<UniqueDigitalCredential | OriginalVerifiableCredential>
  },
) => {
  const CLOCK_SKEW = 120
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
  const aud = request.authorizationRequest.getMergedProperty<string>('aud');
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

  const dcqlCredentialsWithCredentials = new Map(
    args.credentials.map((vc) => [convertToDcqlCredentials(vc), vc])
  )

  const queryResult = DcqlQuery.query(request.dcqlQuery, Array.from(dcqlCredentialsWithCredentials.keys()))

  const presentation: DcqlPresentation.Output = {}
  const uniqueCredentials = Array.from(dcqlCredentialsWithCredentials.values())
  for (const [key, value] of Object.entries(queryResult.credential_matches)) {
    if (value.success) {
      const matchedCredentials = value.valid_credentials.map(cred => uniqueCredentials[cred.input_credential_index])
      const vc = matchedCredentials[0] // taking the first match for now
      if (!vc) {
        continue
      }
      const originalVc = retrieveEncodedCredential(vc as UniqueDigitalCredential)
      if (!originalVc) {
        continue
      }

      // FIXME SSISDK-44
      const decodedSdJwt = await CredentialMapper.decodeSdJwtVcAsync(originalVc as string, generateDigest)
      const updatedSdJwt = updateSdJwtCredential(decodedSdJwt, request.requestObject?.getPayload()?.nonce, domain)

      const presentationResult = await agent.createSdJwtPresentation({
        presentation: updatedSdJwt.compactSdJwtVc,
        kb: {
          payload: {
            ...updatedSdJwt.kbJwt?.payload,
            iat: updatedSdJwt.kbJwt?.payload?.iat ?? Math.floor(Date.now() / 1000 - CLOCK_SKEW)
          }
        }
      })

      if (originalVc) {
        presentation[key] = presentationResult.presentation
      }
    }
  }

  const dcqlPresentation = DcqlPresentation.parse(presentation)
  debug(`Presentation:`, JSON.stringify(dcqlPresentation, null, 2));

  const response = session.sendAuthorizationResponse({
    responseSignerOpts: identifier,
    dcqlResponse: {
      dcqlPresentation
    }
  })

  debug(`Response: `, response);
  return response;
};

const retrieveEncodedCredential = (credential: UniqueDigitalCredential): OriginalVerifiableCredential | undefined => {
  return credential.originalVerifiableCredential !== undefined &&
  credential.originalVerifiableCredential !== null &&
  (credential?.originalVerifiableCredential as SdJwtDecodedVerifiableCredential)?.compactSdJwtVc !== undefined &&
  (credential?.originalVerifiableCredential as SdJwtDecodedVerifiableCredential)?.compactSdJwtVc !== null
    ? (credential.originalVerifiableCredential as SdJwtDecodedVerifiableCredential).compactSdJwtVc
    : credential.originalVerifiableCredential
}

const updateSdJwtCredential = (
  credential: SdJwtDecodedVerifiableCredential | PartialSdJwtDecodedVerifiableCredential,
  nonce?: string,
  aud?: string
): PartialSdJwtDecodedVerifiableCredential => {
  const sdJwtCredential = credential as SdJwtDecodedVerifiableCredential;

  // extract sd_alg or default to sha-256
  const hashAlg = sdJwtCredential.signedPayload._sd_alg ?? 'sha-256';
  const sdHash = calculateSdHash(sdJwtCredential.compactSdJwtVc, hashAlg, generateDigest);

  const kbJwt = {
    // alg MUST be set by the signer
    header: {
      typ: 'kb+jwt',
    },
    payload: {
      iat: Math.floor(new Date().getTime() / 1000),
      sd_hash: sdHash,
      ...(nonce && { nonce }),
      ...(aud && { aud })
    },
  } satisfies PartialSdJwtKbJwt;

  return {
    ...sdJwtCredential,
    kbJwt,
  } satisfies PartialSdJwtDecodedVerifiableCredential;
}
