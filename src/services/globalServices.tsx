import {createContext} from 'react';
import {ActorRefFrom} from 'xstate';
import {CreateOnboardingMachineType} from '../machines/onboardingMachine';

interface GlobalStateContextType {
  onboardingService: ActorRefFrom<CreateOnboardingMachineType>;
}

export const GlobalStateContext = createContext({} as GlobalStateContextType);
/*

export const GlobalStateProvider = (props: any): JSX.Element => {
  // todo: Onboardig should not need global context. It is only used once during wallet init! Just here for testing
  // should be moved to correct location afterwards

  return <GlobalStateContext.Provider value={{onboardingService}}>{props.children}</GlobalStateContext.Provider>;
};
*/
