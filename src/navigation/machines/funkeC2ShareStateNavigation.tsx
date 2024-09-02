import {
  FunkeC2ShareContextType,
  FunkeC2ShareMachineContext,
  FunkeC2ShareMachineEvents,
  FunkeC2ShareMachineInterpreter,
  FunkeC2ShareMachineState,
  FunkeC2ShareMachineStateTypes,
  FunkeC2ShareProviderProps,
} from '../../types/machines/funkeC2ShareMachine';
import React, {Context, createContext} from 'react';
import RootNavigation from '../rootNavigation';
import Debug, {Debugger} from 'debug';
import {APP_ID} from '../../@config/constants';
import {MainRoutesEnum, NavigationBarRoutesEnum, ScreenRoutesEnum} from '../../types';
import {translate} from '../../localization/Localization';
import {GetPIDCredentialsMachineEvents, GetPIDCredentialsMachineStateTypes} from '../../types/machines/getPIDCredentialMachine';
import {GetPIDCredentialsMachine} from '../../machines/getPIDCredentialMachine';
import {FunkeC2ShareMachine} from '../../machines/funkeC2ShareMachine';
import {OID4VCIMachineStates} from '@sphereon/ssi-sdk.oid4vci-holder';

const debug: Debugger = Debug(`${APP_ID}:funkeC2ShareStateNavigation`);

export const FunkeC2ShareContext: Context<FunkeC2ShareContextType> = createContext({} as FunkeC2ShareContextType);

const navigateLoading = async (args: any): Promise<void> => {
  const {navigation} = args;
  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
    // TODO
    screen: ScreenRoutesEnum.LOADING,
    params: {
      message: translate('action_getting_information_message'),
    },
  });
};

const navigateAcceptRequestInformation = async (args: any): Promise<void> => {
  const {navigation, machine} = args;
  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
    screen: 'ImportDataConsent',
    params: {
      onBack: async () => machine.send(FunkeC2ShareMachineEvents.PREVIOUS),
      onAccept: async () => machine.send(FunkeC2ShareMachineEvents.NEXT),
      onDecline: async () => machine.send(FunkeC2ShareMachineEvents.PREVIOUS),
    },
  });
};

const navigateFinal = async (args: any): Promise<void> => {
  const {navigation} = args;
  FunkeC2ShareMachine.clearInstance({stop: true});
  navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
    screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
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
    void navigateLoading({navigation, context, machine: funkeCShareMachine});
  } else if (state.matches(FunkeC2ShareMachineStateTypes.acceptRequestInformation)) {
    void navigateAcceptRequestInformation({navigation, context, machine: funkeCShareMachine});
  } else if (
    state.matches(OID4VCIMachineStates.done) ||
    state.matches(OID4VCIMachineStates.error) ||
    state.matches(OID4VCIMachineStates.aborted) ||
    state.matches(OID4VCIMachineStates.declined)
  ) {
    void navigateFinal({navigation});
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
