import {getFirstKeyWithRelation} from '@sphereon/ssi-sdk-ext.did-utils';
import {VerifiableCredential} from '@veramo/core';
import {v4 as uuidv4} from 'uuid';

import agent from '../agent';
import store from '../store';

import {createUser, login} from '../store/actions/user.actions';
import {IOnboardingMachineContext, IUser} from '../types';
import {createVerifiableCredential, storeVerifiableCredential} from './credentialService';
import {getOrCreatePrimaryIdentifier} from './identityService';
import {storagePersistPin} from './storageService';

export const walletSetup = async (context: IOnboardingMachineContext) => {
  return await Promise.all([
    storagePersistPin({
      value: context.pinCode,
    }),
    finalizeOnboarding(context),
    // Make sure we never finish before the timeout, to ensure the UI doesn't change too fast as a user might get confused
    new Promise(resolve => setTimeout(() => resolve(true), 1500)),
  ])
    .then(value => {
      store.dispatch<any>(login(value[1].storedUser.id));
      return value[1];
    })
    .catch(e => Promise.reject(e));
};

const finalizeOnboarding = async (context: IOnboardingMachineContext) => {
  const identifier = await getOrCreatePrimaryIdentifier({method: context.credentialData.didMethod});

  const personalData = context.personalData;
  const user = {
    ...personalData,
    identifiers: [{did: identifier.did}],
  };
  const storedUser: IUser = await store.dispatch<any>(createUser(user));

  const cred = context.credentialData.credential;

  const ctx = {...agent?.context, agent};
  const verifiableCredential = await getFirstKeyWithRelation(identifier, ctx, 'authentication').then(key =>
    createVerifiableCredential({
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
    }).then((vc: VerifiableCredential) => {
      storeVerifiableCredential({vc});
      return vc;
    }),
  );
  return {identifier, storedUser, verifiableCredential};
};
