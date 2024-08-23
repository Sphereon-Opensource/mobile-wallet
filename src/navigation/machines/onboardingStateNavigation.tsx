import Debug, {Debugger} from 'debug';
import React, {Context, createContext} from 'react';
import {APP_ID} from '../../@config/constants';
import {OnboardingMachine} from '../../machines/onboardingMachine';
import {
  OnboardingContext as OnboardingContextType,
  OnboardingMachineContext,
  OnboardingMachineInterpreter,
  OnboardingMachineNavigationArgs,
  OnboardingMachineState,
  OnboardingMachineStateType,
  OnboardingProviderProps,
} from '../../types/machines/onboarding';
import RootNavigation from './../rootNavigation';

const debug: Debugger = Debug(`${APP_ID}:onboardingStateNavigation`);

export const OnboardingContext: Context<OnboardingContextType> = createContext({} as OnboardingContextType);

export const onboardingStateNavigationListener = (onboardingMachine: OnboardingMachineInterpreter, state: OnboardingMachineState): void => {
  if (state._event.type === 'internal') {
    // Make sure we do not navigate when triggered by an internal event. We need to stay on current screen
    // Make sure we do not navigate when state has not changed
    return;
  }
  const context: OnboardingMachineContext = onboardingMachine.getSnapshot().context;
  const navigation = RootNavigation;
  if (navigation === undefined || !navigation.isReady()) {
    debug(`navigation not ready yet`);
    return;
  }
  // TODO: Fix type casting, properly get access to the navigation object
  const onboardingNavigation = navigation as OnboardingMachineNavigationArgs['navigation'];

  switch (state.value) {
    case OnboardingMachineStateType.showIntro:
      onboardingNavigation.navigate('Welcome', {});
      break;
    case OnboardingMachineStateType.showProgress:
      onboardingNavigation.navigate('ShowProgress', {});
      break;
    case OnboardingMachineStateType.enterName:
      onboardingNavigation.navigate('EnterName', {});
      break;
    case OnboardingMachineStateType.enterEmailAddress:
      onboardingNavigation.navigate('EnterEmailAddress', {});
      break;
    case OnboardingMachineStateType.enterCountry:
      onboardingNavigation.navigate('EnterCountry', {});
      break;
    case OnboardingMachineStateType.enterPinCode:
      onboardingNavigation.navigate('EnterPinCode', {});
      break;
    case OnboardingMachineStateType.verifyPinCode:
      onboardingNavigation.navigate('VerifyPinCode', {});
      break;
    case OnboardingMachineStateType.enableBiometrics:
      onboardingNavigation.navigate('EnableBiometrics', {});
      break;
    case OnboardingMachineStateType.acceptTermsAndPrivacy:
      onboardingNavigation.navigate('AcceptTermsAndPrivacy', {});
      break;
    case OnboardingMachineStateType.readTerms:
      onboardingNavigation.navigate('ReadTermsAndPrivacy', {document: 'terms'});
      break;
    case OnboardingMachineStateType.readPrivacy:
      onboardingNavigation.navigate('ReadTermsAndPrivacy', {document: 'privacy'});
      break;
    case OnboardingMachineStateType.importPersonalData:
      onboardingNavigation.navigate('ImportPersonalData', {});
      break;
    case OnboardingMachineStateType.importDataConsent:
      onboardingNavigation.navigate('ImportDataConsent', {});
      break;
    case OnboardingMachineStateType.importDataAuthentication:
      onboardingNavigation.navigate('ImportDataAuthentication', {});
      break;
    case OnboardingMachineStateType.retrievePIDCredentials:
      onboardingNavigation.navigate('ImportDataLoader', {});
      break;
    case OnboardingMachineStateType.importDataFinal:
      onboardingNavigation.navigate('ImportDataFinal', {});
      break;
    default:
      throw new Error(`Navigation for ${JSON.stringify(state)} is not implemented!`); // Should not happen, so we throw an error
  }
};

export const OnboardingProvider = (props: OnboardingProviderProps): JSX.Element => {
  const {children, customOnboardingInstance} = props;

  return (
    <OnboardingContext.Provider value={{onboardingInstance: customOnboardingInstance ?? OnboardingMachine.getInstance({requireExisting: true})}}>
      {children}
    </OnboardingContext.Provider>
  );
};
