import { IIdentifier, VerifiableCredential } from '@veramo/core'
import {Action, CombinedState} from 'redux';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';
import {getOrCreatePrimaryIdentifier} from '../../services/identityService';
import {RootState, SupportedDidMethodEnum} from '../../types';
import {CLEAR_ONBOARDING, SET_PERSONAL_DATA_SUCCESS} from '../../types/store/onboarding.action.types';
import {ISetPersonalDataActionArgs} from '../../types/store/onboarding.types';
import {createVerifiableCredential} from './credential.actions';
import {createUser} from './user.actions';
import {
  createVerifiableCredential as createCredential,
  storeVerifiableCredential as storeCredential
} from '../../services/credentialService'

const {v4: uuidv4} = require('uuid');

export const setPersonalData = (args: ISetPersonalDataActionArgs): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: SET_PERSONAL_DATA_SUCCESS, payload: args});
  };
};

export const finalizeOnboarding = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>, getState: CombinedState<any>) => {
    getOrCreatePrimaryIdentifier({method: SupportedDidMethodEnum.DID_KEY}).then((identifier: IIdentifier) => {
      const onboardingState = getState().onboarding;
      const user = {
        firstName: onboardingState.firstName,
        lastName: onboardingState.lastName,
        emailAddress: onboardingState.emailAddress,
        identifiers: [{did: identifier.did}],
      };
      dispatch(createUser(user)).then(() => {
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
          proofFormat: 'lds',
        })
        .then((vc: VerifiableCredential) => storeCredential({vc}))
        dispatch({type: CLEAR_ONBOARDING});
      });
    });
  };
};
