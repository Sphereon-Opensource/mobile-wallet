import {CredentialCorrelationType, Party, RegulationType} from '@sphereon/ssi-sdk.data-store-types';
import {ActionType, CredentialMapper, CredentialRole, DefaultActionSubType, InitiatorType, LogLevel, SubSystem, System} from '@sphereon/ssi-types';
import {computeEntryHash} from '@veramo/utils';
import agent from '../../agent';
import store from '../../store';
import {deleteVerifiableCredential, getVerifiableCredentials} from '../../store/actions/credential.actions';
import {GetPIDCredentialsMachineContext, MappedCredential} from '../../types/machines/getPIDCredentialMachine';
import {generateDigest, getCredentialIssuerContact, getCredentialSubjectContact} from '../../utils';
import {getVerifiableCredentialsFromStorage} from '../credentialService';
import {PartyCorrelationType} from '@sphereon/ssi-sdk.core';
import {storeActivityLogging, storeAuditLogging} from '../../store/actions/logging.actions';
import {VerifiableCredential} from '@veramo/core';
import {toCredentialSummary} from '@sphereon/ui-components.credential-branding';
import PersonalIdentificationDataBranding from '../../@config/branding/PersonalIdentificationDataBranding.json';

export const retrievePIDCredentials = async (context: Pick<GetPIDCredentialsMachineContext, 'funkeProvider'>): Promise<Array<MappedCredential>> => {
  const {funkeProvider} = context;

  if (!funkeProvider?.refreshUrl) {
    return Promise.reject(Error('Missing ausweis refresh url in context'));
  }

  return funkeProvider
    .getAuthorizationCode()
    .then((authorizationCode: string) => funkeProvider.getPids({authorizationCode}))
    .then(pidResponses => {
      return pidResponses.map(pidResponse => {
        const credential = pidResponse.credentials?.find(c => c);
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

export const storePIDCredentials = async (context: Pick<GetPIDCredentialsMachineContext, 'pidCredentials'>): Promise<void> => {
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
    const issuer: Party | undefined = getCredentialIssuerContact(uniform);
    const credentialSummary = await toCredentialSummary({
      verifiableCredential: mappedCredential.uniformCredential as VerifiableCredential,
      hash: digitalCredential.hash,
      credentialRole: uniform.credentialRole,
      issuer,
      branding: [PersonalIdentificationDataBranding],
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
          credential: credentialSummary,
        },
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

export const storeCredentialBranding = async (context: Pick<GetPIDCredentialsMachineContext, 'pidCredentials'>): Promise<void> => {
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

export const fetchVerifiableCredentials = async (context: GetPIDCredentialsMachineContext): Promise<void> => {
  store.dispatch<any>(getVerifiableCredentials());
};
