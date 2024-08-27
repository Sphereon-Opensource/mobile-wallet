import {MappedCredential, OnboardingMachineContext, WalletSetupServiceResult} from '../../types/machines/onboarding';
import {CredentialMapper} from '@sphereon/ssi-types';
import {CredentialCorrelationType, CredentialRole, DigitalCredential} from '@sphereon/ssi-sdk.data-store';
import {computeEntryHash} from '@veramo/utils';
import {generateDigest} from '../../utils';
import agent from '../../agent';
import {storagePersistPin} from '../storageService';
import store from '../../store';
import {createUser, login} from '../../store/actions/user.actions';
import {BasicUser, IUser} from '../../types';

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
        const rawCredential = typeof credential === 'string' ? credential : JSON.stringify(credential);
        const uniformCredential = CredentialMapper.toUniformCredential(rawCredential, {hasher: generateDigest});

        return {
          uniformCredential,
          rawCredential,
        };
      });
    });
};

export const storePIDCredentials = async (context: Pick<OnboardingMachineContext, 'pidCredentials'>): Promise<Array<DigitalCredential>> => {
  const {pidCredentials} = context;

  const storeCredentials = pidCredentials.map((mappedCredential: MappedCredential) =>
    agent.crsAddCredential({
      credential: {
        rawDocument: mappedCredential.rawCredential,
        credentialRole: CredentialRole.HOLDER,
        credentialId: mappedCredential.uniformCredential.id ?? computeEntryHash(mappedCredential.rawCredential),
        kmsKeyRef: 'FIXME', // FIXME Funke
        identifierMethod: 'x5c', // FIXME Funke
        issuerCorrelationId: 'https://demo.pid-issuer.bundesdruckerei.de',
        issuerCorrelationType: CredentialCorrelationType.URL,
      },
      opts: {hasher: generateDigest},
    }),
  );

  return Promise.all(storeCredentials);
};

export const setupWallet = async (
  context: Pick<OnboardingMachineContext, 'pinCode' | 'emailAddress' | 'name'>,
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

const storeUser = async (context: Pick<OnboardingMachineContext, 'emailAddress' | 'name'>): Promise<WalletSetupServiceResult> => {
  const {emailAddress, name} = context;

  const names = parseFullName(name);

  const user: BasicUser = {
    firstName: names.firstName,
    lastName: names.lastName,
    emailAddress,
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
