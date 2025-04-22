import Debug, {Debugger} from 'debug';
import React, {createContext, ReactElement} from 'react';
import {APP_ID} from '../../@config/constants';
import RootNavigation from '../rootNavigation';
import {MainRoutesEnum, NavigationBarRoutesEnum, PopupImagesEnum, ScreenRoutesEnum} from '../../types';
import {translate} from '../../localization/Localization';
import {ESIMActivationMachine} from '../../machines/activateESimMachine';
import {
  ESIMActivationMachineContext,
  ESIMActivationMachineEvents,
  ESIMActivationMachineInterpreter,
  ESIMActivationMachineState,
  ESIMActivationMachineStateTypes,
  ESIMActivationProviderProps,
} from '../../types/machines/activateESimMachine';

const debug: Debugger = Debug(`${APP_ID}:activateESimStateNavigation`);

export const ESIMActivationContext = createContext<{activateESimInstance: ESIMActivationMachineInterpreter}>(
  {} as {
    activateESimInstance: ESIMActivationMachineInterpreter;
  },
);

const navigateLoading = async (args: any): Promise<void> => {
  const {navigation} = args;
  navigation.navigate(MainRoutesEnum.ACTIVATE_ESIM, {
    screen: ScreenRoutesEnum.LOADING,
    params: {
      message: translate('action_getting_information_message'),
    },
  });
};

export const activateESimStateNavigationListener = (
  activateESimMachine: ESIMActivationMachineInterpreter,
  state: ESIMActivationMachineState,
): void => {
  if (state._event.type === 'internal') {
    return;
  }
  console.debug('activateESimStateNavigationListener received state', state.value);
  const context: ESIMActivationMachineContext = activateESimMachine.getSnapshot().context;
  const navigation = RootNavigation;
  if (navigation === undefined || !navigation.isReady()) {
    debug(`navigation not ready yet`);
    return;
  }

  switch (state.value) {
    case ESIMActivationMachineStateTypes.esim_init:
    case ESIMActivationMachineStateTypes.createMusapLink:
    case ESIMActivationMachineStateTypes.getCoupledWithCode:
    case ESIMActivationMachineStateTypes.cleanupKeys:
    case ESIMActivationMachineStateTypes.checkSscd:
    case ESIMActivationMachineStateTypes.enableSscd:
    case ESIMActivationMachineStateTypes.coupleWithRP:
    case ESIMActivationMachineStateTypes.bindKey:
      console.debug('ESIMActivationMachine navigate to loading screen');
      void navigateLoading({navigation, context, machine: activateESimMachine});
      break;
    case ESIMActivationMachineStateTypes.enterDetails:
      console.debug('Navigating to EnterESimDetails with context:', context);
      navigation.navigate(MainRoutesEnum.ACTIVATE_ESIM, {
        screen: ScreenRoutesEnum.ENTER_ESIM_DETAILS,
        params: {
          coupledWithCode: context.coupledWithCode,
          msisdn: context.msisdn,
          onBack: async () => {
            return activateESimMachine.send(ESIMActivationMachineEvents.PREVIOUS);
          },
          onNext: async (msisdn: string, couplingCode: string) => {
            console.debug('Sending coupling code & msisdn to machine context', msisdn, couplingCode);
            activateESimMachine.send(ESIMActivationMachineEvents.SET_MSISDN, {msisdn});
            activateESimMachine.send(ESIMActivationMachineEvents.SET_COUPLING_CODE, {couplingCode});
            console.debug('Sending activateESimMachine NEXT');
            return activateESimMachine.send(ESIMActivationMachineEvents.NEXT);
          },
        },
      });
      break;

    case ESIMActivationMachineStateTypes.handleError: {
      const {error} = context;

      if (!error) {
        throw new Error(`Missing error in context`);
      }

      navigation.navigate(ScreenRoutesEnum.ERROR, {
        image: PopupImagesEnum.WARNING,
        title: error.title,
        details: error.message,
        ...(error.detailsMessage && {
          detailsPopup: {
            buttonCaption: translate('action_view_extra_details'),
            title: error.detailsTitle,
            details: error.detailsMessage,
          },
        }),
        primaryButton: {
          caption: translate('action_ok_label'),
          accessibilityLabel: `${translate('action_ok_label')}. Exit flow`,
          onPress: () => activateESimMachine.send(ESIMActivationMachineEvents.PREVIOUS),
        },
        onBack: () => activateESimMachine.send(ESIMActivationMachineEvents.PREVIOUS),
      });
      break;
    }

    case ESIMActivationMachineStateTypes.success:
    case ESIMActivationMachineStateTypes.abort:
    case ESIMActivationMachineStateTypes.error: {
      ESIMActivationMachine.clearInstance({stop: true});
      break;
    }
    default:
      throw new Error(`Navigation for ${JSON.stringify(state)} is not implemented!`);
  }
};

export const ESIMActivationProvider = (props: ESIMActivationProviderProps): ReactElement => {
  const {children, customESIMActivationInstance} = props;

  return (
    <ESIMActivationContext.Provider
      value={{
        activateESimInstance: customESIMActivationInstance ?? ESIMActivationMachine.getInstance(),
      }}>
      {children}
    </ESIMActivationContext.Provider>
  );
};
