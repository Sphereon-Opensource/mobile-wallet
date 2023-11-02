import {getFirstKeyWithRelation, mapIdentifierKeysToDocWithJwkSupport} from '@sphereon/ssi-sdk-ext.did-utils';
import {IAgentContext, IIdentifier, IResolver, VerifiableCredential} from '@veramo/core';
import {Action, CombinedState} from 'redux';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';

import agent from '../../agent';
import {createVerifiableCredential as createCredential, storeVerifiableCredential as storeCredential} from '../../services/credentialService';
import {getOrCreatePrimaryIdentifier} from '../../services/identityService';
import {IOnboardingMachineContext, NextEvent, OnboardingEvents} from '../../services/onboardingMachine';
import {IUser, RootState, SupportedDidMethodEnum} from '../../types';
import {CLEAR_ONBOARDING, ONBOARDING_LOADING, SET_PERSONAL_DATA_SUCCESS} from '../../types/store/onboarding.action.types';
import {IOnboardingState, ISetPersonalDataActionArgs} from '../../types/store/onboarding.types';
import store from '../index';

import {createUser, login} from './user.actions';

const {v4: uuidv4} = require('uuid');

export const setPersonalData = (args: ISetPersonalDataActionArgs): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: SET_PERSONAL_DATA_SUCCESS, payload: args});
  };
};

export const finalizeOnboarding = async (context: IOnboardingMachineContext) => {
  store.dispatch({type: ONBOARDING_LOADING});
  const identifier = await getOrCreatePrimaryIdentifier({method: SupportedDidMethodEnum.DID_KEY});

  const personalData = context.personalData;
  const user = {
    firstName: personalData.firstName!,
    lastName: personalData.lastName!,
    emailAddress: personalData.emailAddress!,
    identifiers: [{did: identifier.did}],
  };
  const storedUser: IUser = await store.dispatch<any>(createUser(user));

  const ctx = {...agent?.context, agent};
  await getFirstKeyWithRelation(identifier, ctx, 'authentication').then(key =>
    createCredential({
      credential: {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://sphereon-opensource.github.io/ssi-mobile-wallet/context/sphereon-wallet-identity-v1.jsonld',
        ],
        id: `urn:uuid:${uuidv4()}`,
        type: ['VerifiableCredential', 'SphereonWalletIdentityCredential'],
        issuer: identifier.did,
        issuanceDate: new Date(),
        credentialSubject: {
          id: identifier.did,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
        },
      },
      proofFormat: 'jwt',
      header: {
        kid: key?.meta?.verificationMethod?.id,
      },
    }).then((vc: VerifiableCredential) => {
      storeCredential({vc});
      return vc;
    }),
  );
  store.dispatch<any>(login(storedUser.id)).then(() => store.dispatch({type: CLEAR_ONBOARDING}));
  return true;
};
