import {getFirstKeyWithRelation} from '@sphereon/ssi-sdk-ext.did-utils';
import {v4 as uuidv4} from 'uuid';

import agent from '../agent';
import store from '../store';

import {createUser, login} from '../store/actions/user.actions';
import {IUser} from '../types';
import {IOnboardingMachineContext, WalletSetupServiceResult} from '../types/onboarding';
import {createVerifiableCredential, storeVerifiableCredential} from './credentialService';
import {getOrCreatePrimaryIdentifier} from './identityService';
import {storagePersistPin} from './storageService';

export const setupWallet = async (context: IOnboardingMachineContext): Promise<WalletSetupServiceResult> => {
  const setup = await Promise.all([
    storagePersistPin({
      value: context.pinCode,
    }),
    createUserAndIdentity(context),
    // Make sure we never finish before the timeout, to ensure the UI doesn't navigate too fast for a user between screens
    new Promise(resolve => setTimeout(() => resolve(true), 1000)),
  ]);

  await store.dispatch<any>(login(setup[1].storedUser.id));
  return setup[1];
};

const createUserAndIdentity = async (context: IOnboardingMachineContext): Promise<WalletSetupServiceResult> => {
  const identifier = await getOrCreatePrimaryIdentifier({method: context.credentialData.didMethod});

  const personalData = context.personalData;
  const cred = context.credentialData.credential;
  const ctx = {...agent?.context, agent};
  const key = await getFirstKeyWithRelation(identifier, ctx, 'authentication');
  const verifiableCredential = await createVerifiableCredential({
    credential: {
      ...cred,
      '@context': cred?.['@context'] ?? [
        'https://www.w3.org/2018/credentials/v1',
        'https://sphereon-opensource.github.io/ssi-mobile-wallet/context/sphereon-wallet-identity-v1.jsonld',
      ],
      id: cred?.id ?? `urn:uuid:${uuidv4()}`,
      type: cred?.type ?? ['VerifiableCredential', 'SphereonWalletIdentityCredential'],
      issuer: cred?.issuer ?? identifier.did,
      issuanceDate: cred?.issuanceDate ?? new Date(),
      credentialSubject: {
        ...cred?.credentialSubject,
        id: cred?.id ?? identifier.did,
        ...personalData,
      },
    },
    proofFormat: context.credentialData.proofFormat ?? 'jwt',
    header: {
      kid: key?.meta?.verificationMethod?.id,
    },
  });
  await storeVerifiableCredential({vc: verifiableCredential});

  const user = {
    ...personalData,
    identifiers: [{did: identifier.did}],
  };

  const storedUser: IUser = await store.dispatch<any>(createUser(user));
  return {identifier, storedUser, verifiableCredential};
};
