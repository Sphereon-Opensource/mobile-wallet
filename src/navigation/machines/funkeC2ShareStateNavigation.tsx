import {
  FunkeC2ShareContextType,
  FunkeC2ShareMachineContext,
  FunkeC2ShareMachineInterpreter,
  FunkeC2ShareMachineState,
  FunkeC2ShareMachineStateTypes,
  FunkeC2ShareProviderProps,
} from '../../types/machines/funkeC2ShareMachine';
import React, {Context, createContext} from 'react';
import RootNavigation from '../rootNavigation';
import Debug, {Debugger} from 'debug';
import {APP_ID} from '../../@config/constants';
import {MainRoutesEnum, ScreenRoutesEnum} from '../../types';
import {translate} from '../../localization/Localization';

const debug: Debugger = Debug(`${APP_ID}:funkeC2ShareStateNavigation`);

export const FunkeC2ShareContext: Context<FunkeC2ShareContextType> = createContext({} as FunkeC2ShareContextType);

const navigateLoading = async (args: any): Promise<void> => {
  const {navigation} = args;
  navigation.navigate(MainRoutesEnum.SIOPV2, {
    // TODO
    screen: ScreenRoutesEnum.LOADING,
    params: {
      message: translate('action_getting_information_message'),
    },
  });
};

export const funkeC2ShareStateNavigationListener = (funkeCShareMachine: FunkeC2ShareMachineInterpreter, state: FunkeC2ShareMachineState): void => {
  if (state._event.type === 'internal') {
    // Make sure we do not navigate when triggered by an internal event. We need to stay on current screen
    // Make sure we do not navigate when state has not changed
    return;
  }
  const context: FunkeC2ShareMachineContext = funkeCShareMachine.getSnapshot().context;
  const navigation = RootNavigation;
  if (navigation === undefined || !navigation.isReady()) {
    debug(`navigation not ready yet`);
    return;
  }

  if (
    state.matches(FunkeC2ShareMachineStateTypes.createConfig) ||
    state.matches(FunkeC2ShareMachineStateTypes.getSiopRequest) ||
    state.matches(FunkeC2ShareMachineStateTypes.retrieveContact)
  ) {
    void navigateLoading({navigation, context});
  }

  // switch (state.value) {
  //   case FunkeC2ShareMachineStateTypes.createConfig:
  //     navigation.navigate(MainRoutesEnum.OID4VCI, { // TODO
  //       screen: ScreenRoutesEnum.LOADING,
  //       params: {
  //         message: translate('action_getting_information_message'),
  //       },
  //     });
  //   default:
  //     throw new Error(`Navigation for ${JSON.stringify(state)} is not implemented!`); // Should not happen, so we throw an error
  // }
};

export const FunkeC2ShareProvider = (props: FunkeC2ShareProviderProps): JSX.Element => {
  const {children, customFunkeC2ShareInstance} = props;

  return <FunkeC2ShareContext.Provider value={{funkeC2ShareInstance: customFunkeC2ShareInstance}}>{children}</FunkeC2ShareContext.Provider>;
};
