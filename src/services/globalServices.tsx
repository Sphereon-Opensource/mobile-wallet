import {useInterpret} from '@xstate/react';
import {createContext} from 'react';
import {OnboardingMachine} from './onboardingMachine';

export const GlobalStateContext = createContext({});

export const GlobalStateProvider = (props: any) => {
  // todo: Onboardig should not need global context. It is only used once during wallet init! Just here for testing
  const onboarding = useInterpret(OnboardingMachine);
  return <GlobalStateContext.Provider value={{onboarding}}>{props.children}</GlobalStateContext.Provider>;
};
