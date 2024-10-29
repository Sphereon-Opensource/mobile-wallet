import VciServiceFunkeCProvider from '../../providers/authentication/funke/VciServiceFunkeCProvider';
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
import {MainRoutesEnum, NavigationBarRoutesEnum, PopupImagesEnum, ScreenRoutesEnum} from '../../types';
import {translate} from '../../localization/Localization';
import {FunkeC2ShareMachine} from '../../machines/funkeC2ShareMachine';
import {delay} from '../../utils';
import {GetPIDCredentialsMachineEvents} from '../../types/machines/getPIDCredentialMachine';

const debug: Debugger = Debug(`${APP_ID}:funkeC2ShareStateNavigation`);

export const FunkeC2ShareContext: Context<FunkeC2ShareContextType> = createContext({} as FunkeC2ShareContextType);

const navigateLoading = async (args: any): Promise<void> => {
  const {navigation} = args;
  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
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

const navigateAuthenticateAusweisEID = async (args: any): Promise<void> => {
  const {navigation, machine} = args;
  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
    screen: 'ImportPersonalData',
    params: {
      onBack: async () => machine.send(FunkeC2ShareMachineEvents.PREVIOUS),
      onAuth: async (provider: VciServiceFunkeCProvider) => {
        machine.send(FunkeC2ShareMachineEvents.SET_FUNKE_PROVIDER, {data: provider});
        // Adding a small delay to let the animation play
        await delay(600);
        machine.send(FunkeC2ShareMachineEvents.NEXT);
      },
    },
  });
};

const navigateAuthenticate = async (args: any): Promise<void> => {
  const {navigation, machine} = args;
  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
    screen: 'ImportDataAuthentication',
    params: {
      onBack: async () => machine.send(FunkeC2ShareMachineEvents.PREVIOUS),
      onAccept: async () => machine.send(FunkeC2ShareMachineEvents.NEXT),
    },
  });
};

const navigateAcceptShareCredential = async (args: any): Promise<void> => {
  const {navigation, machine, context} = args;
  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
    screen: 'ImportDataFinal',
    params: {
      onBack: async () => machine.send(FunkeC2ShareMachineEvents.PREVIOUS),
      onAccept: async () => machine.send(FunkeC2ShareMachineEvents.NEXT),
      onDecline: async () => machine.send(FunkeC2ShareMachineEvents.DECLINE),
      credentials: context.pidCredentials,
      isShareFlow: true,
    },
  });
};

const navigateHandleError = async (args: any): Promise<void> => {
  const {navigation, machine, context} = args;

  if (!context.error) {
    throw new Error(`Missing error in context`);
  }

  navigation.navigate(ScreenRoutesEnum.ERROR, {
    image: PopupImagesEnum.WARNING,
    title: context.error.title,
    details: context.error.message,
    ...(context.error.detailsMessage && {
      detailsPopup: {
        buttonCaption: translate('action_view_extra_details'),
        title: context.error.detailsTitle,
        details: context.error.detailsMessage,
      },
    }),
    primaryButton: {
      caption: translate('action_ok_label'),
      onPress: () => machine.send(GetPIDCredentialsMachineEvents.PREVIOUS),
    },
    onBack: () => machine.send(GetPIDCredentialsMachineEvents.PREVIOUS),
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
    state.matches(FunkeC2ShareMachineStateTypes.retrieveContact) ||
    state.matches(FunkeC2ShareMachineStateTypes.retrievePIDCredentials)
  ) {
    void navigateLoading({navigation, context, machine: funkeCShareMachine});
  } else if (state.matches(FunkeC2ShareMachineStateTypes.acceptRequestInformation)) {
    void navigateAcceptRequestInformation({navigation, context, machine: funkeCShareMachine});
  } else if (state.matches(FunkeC2ShareMachineStateTypes.authenticateAusweisEID)) {
    void navigateAuthenticateAusweisEID({navigation, context, machine: funkeCShareMachine});
  } else if (state.matches(FunkeC2ShareMachineStateTypes.authenticate)) {
    void navigateAuthenticate({navigation, context, machine: funkeCShareMachine});
  } else if (state.matches(FunkeC2ShareMachineStateTypes.acceptShareCredential)) {
    void navigateAcceptShareCredential({navigation, context, machine: funkeCShareMachine});
  } else if (state.matches(FunkeC2ShareMachineStateTypes.handleError)) {
    void navigateHandleError({navigation, context, machine: funkeCShareMachine});
  } else if (
    state.matches(FunkeC2ShareMachineStateTypes.done) ||
    state.matches(FunkeC2ShareMachineStateTypes.error) ||
    state.matches(FunkeC2ShareMachineStateTypes.aborted) ||
    state.matches(FunkeC2ShareMachineStateTypes.declined)
  ) {
    void navigateFinal({navigation});
  }
};

export const FunkeC2ShareProvider = (props: FunkeC2ShareProviderProps): JSX.Element => {
  const {children, customFunkeC2ShareInstance} = props;

  return <FunkeC2ShareContext.Provider value={{funkeC2ShareInstance: customFunkeC2ShareInstance}}>{children}</FunkeC2ShareContext.Provider>;
};
