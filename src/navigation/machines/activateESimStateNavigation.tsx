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

const debug: Debugger = Debug(`${APP_ID}:activateESimStateNavigation`)

export const ESIMActivationContext = createContext<{activateESimInstance: ESIMActivationMachineInterpreter}>({} as {activateESimInstance: ESIMActivationMachineInterpreter})

export const activateESimStateNavigationListener = (
  activateESimMachine: ESIMActivationMachineInterpreter,
  state: ESIMActivationMachineState
): void => {
  if (state._event.type === 'internal') {
    return
  }

  const context: ESIMActivationMachineContext = activateESimMachine.getSnapshot().context
  const navigation = RootNavigation
  if (navigation === undefined || !navigation.isReady()) {
    debug(`navigation not ready yet`)
    return
  }

  switch (state.value) {
    case ESIMActivationMachineStateTypes.enterDetails:
      navigation.navigate(MainRoutesEnum.ACTIVATE_ESIM, {
        screen: 'EnterESimDetails',
        params: {
          onBack: async () => activateESimMachine.send(ESIMActivationMachineEvents.PREVIOUS),
          onNext: async () => activateESimMachine.send(ESIMActivationMachineEvents.NEXT),
          onSetMsisdn: async (msisdn: string) =>
            activateESimMachine.send(ESIMActivationMachineEvents.SET_MSISDN, {msisdn}),
          onSetCouplingCode: async (couplingCode: string) =>
            activateESimMachine.send(ESIMActivationMachineEvents.SET_COUPLING_CODE, {couplingCode}),
          msisdn: context.msisdn,
          couplingCode: context.couplingCode
        }
      })
      break

    case ESIMActivationMachineStateTypes.handleError: {
      const {error} = context

      if (!error) {
        throw new Error(`Missing error in context`)
      }

      navigation.navigate(ScreenRoutesEnum.ERROR, {
        image: PopupImagesEnum.WARNING,
        title: error.title,
        details: error.message,
        ...(error.detailsMessage && {
          detailsPopup: {
            buttonCaption: translate('action_view_extra_details'),
            title: error.detailsTitle,
            details: error.detailsMessage
          }
        }),
        primaryButton: {
          caption: translate('action_ok_label'),
          accessibilityLabel: `${translate('action_ok_label')}. Exit flow`,
          onPress: () => activateESimMachine.send(ESIMActivationMachineEvents.PREVIOUS)
        },
        onBack: () => activateESimMachine.send(ESIMActivationMachineEvents.PREVIOUS)
      })
      break
    }

    case ESIMActivationMachineStateTypes.success: {
      ESIMActivationMachine.clearInstance({stop: true})
      navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
        screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW
      })
      break
    }

    case ESIMActivationMachineStateTypes.error: {
      ESIMActivationMachine.clearInstance({stop: true})
        navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
        screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW
      })
      break
    }

    default:
      throw new Error(`Navigation for ${JSON.stringify(state)} is not implemented!`)
  }
}

export const ESIMActivationProvider = (props: ESIMActivationProviderProps): ReactElement => {
  const {children, customESIMActivationInstance} = props

  return (
    <ESIMActivationContext.Provider value={{
      activateESimInstance: customESIMActivationInstance ?? ESIMActivationMachine.getInstance()
    }}>
      {children}
    </ESIMActivationContext.Provider>
  )
}
