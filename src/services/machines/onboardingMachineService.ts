import {getFirstKeyWithRelation} from '@sphereon/ssi-sdk-ext.did-utils';
import {v4 as uuidv4} from 'uuid';
import agent, {agentContext} from '../../agent';
import store from '../../store';
import {createUser, login} from '../../store/actions/user.actions';
import {BasicUser, IUser} from '../../types';
import {OnboardingMachineContext, WalletSetupServiceResult} from '../../types/machines/onboarding';
import {createVerifiableCredential, storeVerifiableCredential} from '../credentialService';
import {getOrCreatePrimaryIdentifier} from '../identityService';
import {storagePersistPin} from '../storageService';
import {CredentialPayload, IIdentifier, VerifiableCredential} from '@veramo/core';
import {_ExtendedIKey} from '@veramo/utils';
import {CredentialCorrelationType} from '@sphereon/ssi-sdk.data-store/src';
import {CredentialRole} from '@sphereon/ssi-sdk.data-store';

export const setupWallet = async (
  context: Pick<OnboardingMachineContext, 'pinCode' | 'personalData' | 'credentialData'>,
): Promise<WalletSetupServiceResult> => {
  const {pinCode} = context;
  const setup = await Promise.all([
    storagePersistPin({
      value: pinCode,
    }),
    createUserAndIdentity(context),
    // Make sure we never finish before the timeout, to ensure the UI doesn't navigate too fast for a user between screens
    new Promise(resolve => setTimeout(() => resolve(true), 1000)),
  ]);

  await store.dispatch<any>(login(setup[1].storedUser.id));
  return setup[1];
};

const createUserAndIdentity = async (
  context: Pick<OnboardingMachineContext, 'personalData' | 'credentialData'>,
): Promise<WalletSetupServiceResult> => {
  const {personalData, credentialData} = context;
  const identifier: IIdentifier = await getOrCreatePrimaryIdentifier(
    {
      method: credentialData.didMethod,
      createOpts: {options: credentialData.didOptions},
    },
    agentContext,
  );

  const cred: Partial<CredentialPayload> | undefined = credentialData.credential;
  const ctx = {...agent?.context, agent};
  const key: _ExtendedIKey | undefined = await getFirstKeyWithRelation({identifier, vmRelationship: 'authentication'}, ctx);
  const verifiableCredential: VerifiableCredential = await createVerifiableCredential({
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
        id: cred?.credentialSubject?.id ?? identifier.did,
        ...personalData,
      },
    },
    proofFormat: credentialData.proofFormat ?? 'jwt',
    header: {
      kid: key?.meta?.verificationMethod?.id,
    },
  });
  await storeVerifiableCredential({
    credentialRole: CredentialRole.HOLDER, // Here we are both ISSUER & HOLDER but has I think it to be HOLDER due to "oid4vp.filterCredentialsAgainstAllDefinitions(CredentialRole.HOLDER)"
    issuerCorrelationId: identifier.did,
    issuerCorrelationType: CredentialCorrelationType.DID,
    vc: verifiableCredential,
  });

  const user: BasicUser = {
    ...personalData,
    identifiers: [{did: identifier.did}],
  };

  const storedUser: IUser = await store.dispatch<any>(createUser(user));
  return {identifier, storedUser, verifiableCredential};
};
