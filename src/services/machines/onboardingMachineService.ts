import {
  CredentialCorrelationType,
  CredentialRole,
  DigitalCredential,
  Party,
  RegulationType,
} from '@sphereon/ssi-sdk.data-store';
import {ActionType, CredentialMapper, DefaultActionSubType, InitiatorType, LogLevel, SubSystem, System} from '@sphereon/ssi-types';
import {computeEntryHash} from '@veramo/utils';
import agent from '../../agent';
import store from '../../store';
import {createUser, login} from '../../store/actions/user.actions';
import {BasicUser, IUser} from '../../types';
import {MappedCredential} from '../../types/machines/getPIDCredentialMachine';
import {OnboardingMachineContext, OnboardingMachineEventTypes, WalletSetupServiceResult} from '../../types/machines/onboarding';
import {generateDigest, getCredentialSubjectContact} from '../../utils';
import {storagePersistPin} from '../storageService';
import {PartyCorrelationType} from '@sphereon/ssi-sdk.core';
import {storeActivityLogging} from '../../store/actions/logging.actions';
import {ESIMActivationMachine} from '../../machines/activateESimMachine';
import {VerifiableCredential} from '@veramo/core';
import {toCredentialSummary} from '@sphereon/ui-components.credential-branding';
import PersonalIdentificationDataBranding from '../../@config/branding/PersonalIdentificationDataBranding.json';

export const retrievePIDCredentials = async (context: Pick<OnboardingMachineContext, 'funkeProvider'>): Promise<Array<MappedCredential>> => {
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

export const storePIDCredentials = async (context: Pick<OnboardingMachineContext, 'pidCredentials'>): Promise<Array<DigitalCredential>> => {
  const {pidCredentials} = context;

  let parentId: string | undefined = undefined;
  let parentCredentialHash: string | undefined = undefined;
  const storeCredentials: DigitalCredential[] = [];
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

    storeCredentials.push(digitalCredential);

    const uniform = JSON.parse(digitalCredential.uniformDocument) as VerifiableCredential;
    const issuerCorrelationId: string = typeof uniform.issuer === 'string' ? uniform.issuer : uniform.issuer?.id ?? uniform.issuer?.name;
    const getContactsArgs = {
      filter: [{identities: {identifier: {correlationId: issuerCorrelationId}}}]
    };
    const issuer: Party | undefined = (await agent.cmGetContacts(getContactsArgs))[0];
    const credentialSummary = await toCredentialSummary({
      verifiableCredential: uniform,
      hash: digitalCredential.hash,
      credentialRole: uniform.credentialRole,
      issuer,
      branding: [PersonalIdentificationDataBranding],
      subject: getCredentialSubjectContact(uniform),
    })

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

  return storeCredentials;
};

export const setupWallet = async (
  context: Pick<OnboardingMachineContext, 'pinCode' | 'emailAddress' | 'name' | 'biometricsEnabled' | 'pidCredentials' | 'countryCode'>,
): Promise<WalletSetupServiceResult> => {
  const {pinCode} = context;
  const setup = await Promise.all([
    storagePersistPin({
      value: pinCode,
    }),
    storeUser(context),
    // Make sure we never finish before the timeout, to ensure the UI doesn't navigate too fast for a user between screens
    new Promise(resolve => setTimeout(() => resolve(true), 1000)),
  ]);

  await store.dispatch<any>(login(setup[1].storedUser.id));
  return setup[1];
};

const storeUser = async (
  context: Pick<OnboardingMachineContext, 'emailAddress' | 'name' | 'biometricsEnabled' | 'pidCredentials' | 'countryCode'>,
): Promise<WalletSetupServiceResult> => {
  const {emailAddress, name, biometricsEnabled, countryCode} = context;

  const names = parseFullName(name);

  const user: BasicUser = {
    firstName: names.firstName,
    lastName: names.lastName,
    emailAddress,
    biometricsEnabled,
    countryCode: countryCode,
  };

  const storedUser: IUser = await store.dispatch<any>(createUser(user));
  return {storedUser};
};

const parseFullName = (fullName: string) => {
  const nameParts = fullName.trim().split(/\s+/);

  if (nameParts.length === 0) {
    return {firstName: 'Unknown', lastName: 'Unknown'};
  }

  if (nameParts.length === 1) {
    return {firstName: nameParts[0], lastName: ''}; // Profile icon supports just 1 letter
  }

  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return {firstName, lastName};
};

export const storeCredentialBranding = async (context: Pick<OnboardingMachineContext, 'pidCredentials'>): Promise<void> => {
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


export const activateESim = async (
  context: OnboardingMachineContext,
  event: OnboardingMachineEventTypes,
): Promise<void> => {
  console.log('Starting activateESim service with context:', context);

  return new Promise((resolve, reject) => {
    try {
      // Create a new instance of the ESIMActivationMachine
      const esimMachineInstance = ESIMActivationMachine.newInstance();
      console.log('Created ESIMActivationMachine instance');

      esimMachineInstance
      .onDone((doneEvent) => {
        console.log('ESIMActivationMachine done:', doneEvent);
        resolve(doneEvent.data);
      });
      esimMachineInstance.onTransition((state) => {
        console.log('OnboardingMachine<->ESIMActivationMachine state transition:', state.value);
        if (state.matches('success')) {
          console.log('ESIMActivationMachine ended successfully');
          context.esimActivationAborted = false
          resolve();
        } else if (state.matches('abort')) {
          context.esimActivationAborted = true
          resolve();
        }
        else if (state.matches('handleError') || state.matches('error')) {
          console.error('ESIMActivationMachine error:', state.context.error);
          context.esimActivationAborted = false
          reject(state.context.error);
        }
      });
      esimMachineInstance.start();
      console.log('Started ESIMActivationMachine');
    } catch (error) {
      console.error('activateESim service error:', error);
      reject(error);
    }
  });
};
