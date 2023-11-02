import {createContext} from 'react';
import {ActorRefFrom} from 'xstate';
import {createOnboardingMachine} from './onboardingMachine';

interface GlobalStateContextType {
  onboardingService: ActorRefFrom<typeof createOnboardingMachine>;
}

export const GlobalStateContext = createContext({} as GlobalStateContextType);
/*

export const GlobalStateProvider = (props: any): JSX.Element => {
  // todo: Onboardig should not need global context. It is only used once during wallet init! Just here for testing
  // should be moved to correct location afterwards

  return <GlobalStateContext.Provider value={{onboardingService}}>{props.children}</GlobalStateContext.Provider>;
};
*/
