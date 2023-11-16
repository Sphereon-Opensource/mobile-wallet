import {createContext} from 'react';

interface GlobalStateContextType {
  // Onboarding service was here as a test. Removed as that should not be a global service.
  // This file will need to be used in the future for global services/providers though, hence leaving it in
  // onboardingService: ActorRefFrom<CreateOnboardingMachineType>;
}

export const GlobalStateContext = createContext({} as GlobalStateContextType);
/*
export const GlobalStateProvider = (props: any): JSX.Element => {
  todo: Add services here
};
*/
