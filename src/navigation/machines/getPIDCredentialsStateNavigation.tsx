import Debug, {Debugger} from 'debug';
import React, {Context, createContext} from 'react';
import {APP_ID} from '../../@config/constants';
import RootNavigation from './../rootNavigation';
import {MainRoutesEnum, NavigationBarRoutesEnum, PopupImagesEnum, ScreenRoutesEnum} from '../../types';
import {translate} from '../../localization/Localization';
import {GetPIDCredentialsMachine} from '../../machines/getPIDCredentialMachine';
import {
  GetPIDCredentialsContextType,
  GetPIDCredentialsMachineContext,
  GetPIDCredentialsMachineEvents,
  GetPIDCredentialsMachineInterpreter,
  GetPIDCredentialsMachineNavigationArgs,
  GetPIDCredentialsMachineState,
  GetPIDCredentialsMachineStateTypes,
  GetPIDCredentialsProviderProps,
} from '../../types/machines/getPIDCredentialMachine';
import VciServiceFunkeCProvider from '../../providers/authentication/funke/VciServiceFunkeCProvider';
import {delay} from '../../utils';

const debug: Debugger = Debug(`${APP_ID}:getPIDCredentialsStateNavigation`);

export const GetPIDCredentialsContext: Context<GetPIDCredentialsContextType> = createContext({} as GetPIDCredentialsContextType);

export const getPIDCredentialsStateNavigationListener = (
  getPIDCredentialsMachine: GetPIDCredentialsMachineInterpreter,
  state: GetPIDCredentialsMachineState,
): void => {
  if (state._event.type === 'internal') {
    // Make sure we do not navigate when triggered by an internal event. We need to stay on current screen
    // Make sure we do not navigate when state has not changed
    return;
  }
  const context: GetPIDCredentialsMachineContext = getPIDCredentialsMachine.getSnapshot().context;
  const navigation = RootNavigation;
  if (navigation === undefined || !navigation.isReady()) {
    debug(`navigation not ready yet`);
    return;
  }
  // TODO: Fix type casting, properly get access to the navigation object
  const getPIDCredentialsNavigation = navigation as GetPIDCredentialsMachineNavigationArgs['navigation'];

  switch (state.value) {
    case GetPIDCredentialsMachineStateTypes.consentToAddPIDCredentials:
      navigation.navigate(MainRoutesEnum.GET_PID_CREDENTIALS, {
        screen: 'ImportDataConsent',
        params: {
          onBack: async () => getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.PREVIOUS),
          onAccept: async () => getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.NEXT),
          onDecline: async () => getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.PREVIOUS),
        },
      });
      break;
    case GetPIDCredentialsMachineStateTypes.authenticateAusweisEID:
      navigation.navigate(MainRoutesEnum.GET_PID_CREDENTIALS, {
        screen: 'ImportPersonalData',
        params: {
          onBack: async () => getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.PREVIOUS),
          onAuth: async (provider: VciServiceFunkeCProvider) => {
            getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.SET_FUNKE_PROVIDER, {data: provider});
            // Adding a small delay to let the animation play
            await delay(600);
            getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.NEXT);
          },
        },
      });
      break;
    case GetPIDCredentialsMachineStateTypes.authenticate:
      navigation.navigate(MainRoutesEnum.GET_PID_CREDENTIALS, {
        screen: 'ImportDataAuthentication',
        params: {
          onBack: async () => getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.PREVIOUS),
          onAccept: async () => getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.NEXT),
        },
      });
      break;
    case GetPIDCredentialsMachineStateTypes.retrievePIDCredentials:
      navigation.navigate(MainRoutesEnum.GET_PID_CREDENTIALS, {
        screen: 'ImportDataLoader',
      });
      break;
    case GetPIDCredentialsMachineStateTypes.reviewPIDCredentials:
      navigation.navigate(MainRoutesEnum.GET_PID_CREDENTIALS, {
        screen: 'ImportDataFinal',
        params: {
          onBack: async () => getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.PREVIOUS),
          onAccept: async () => getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.NEXT),
          onDecline: async () => getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.DECLINE_INFORMATION),
          credentials: context.pidCredentials,
        },
      });
      break;
    case GetPIDCredentialsMachineStateTypes.declinePIDCredentials:
      navigation.navigate(MainRoutesEnum.GET_PID_CREDENTIALS, {
        screen: 'IncorrectPersonalData',
        params: {
          onDecline: async () => getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.NEXT),
          onBack: async () => getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.PREVIOUS),
        },
      });
      break;
    case GetPIDCredentialsMachineStateTypes.storePIDCredentials:
      navigation.navigate(MainRoutesEnum.GET_PID_CREDENTIALS, {
        screen: 'ImportDataLoaderStore',
      });
      break;
    case GetPIDCredentialsMachineStateTypes.storeCredentialBranding:
      navigation.navigate(MainRoutesEnum.GET_PID_CREDENTIALS, {
        screen: 'ImportDataLoaderStore',
      });
      break;
    case GetPIDCredentialsMachineStateTypes.fetchCredentialsInStore:
      navigation.navigate(MainRoutesEnum.GET_PID_CREDENTIALS, {
        screen: 'ImportDataLoaderStore',
      });
      break;
    case GetPIDCredentialsMachineStateTypes.handleError: {
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
          onPress: () => getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.PREVIOUS),
        },
        onBack: () => getPIDCredentialsMachine.send(GetPIDCredentialsMachineEvents.PREVIOUS),
      });
      break;
    }
    case GetPIDCredentialsMachineStateTypes.done: {
      GetPIDCredentialsMachine.clearInstance({stop: true});
      navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
        screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
      });
      break;
    }
    case GetPIDCredentialsMachineStateTypes.declined: {
      GetPIDCredentialsMachine.clearInstance({stop: true});
      navigation.navigate(NavigationBarRoutesEnum.CREDENTIAL_CATALOG, {
        screen: ScreenRoutesEnum.CREDENTIAL_CATALOG,
      });
      break;
    }
    case GetPIDCredentialsMachineStateTypes.aborted: {
      GetPIDCredentialsMachine.clearInstance({stop: true});
      navigation.navigate(NavigationBarRoutesEnum.CREDENTIAL_CATALOG, {
        screen: ScreenRoutesEnum.CREDENTIAL_CATALOG,
      });
      break;
    }
    case GetPIDCredentialsMachineStateTypes.error: {
      GetPIDCredentialsMachine.clearInstance({stop: true});
      navigation.navigate(NavigationBarRoutesEnum.CREDENTIAL_CATALOG, {
        screen: ScreenRoutesEnum.CREDENTIAL_CATALOG,
      });
      break;
    }
    default:
      throw new Error(`Navigation for ${JSON.stringify(state)} is not implemented!`); // Should not happen, so we throw an error
  }
};

export const GetPIDCredentialsProvider = (props: GetPIDCredentialsProviderProps): JSX.Element => {
  const {children, customGetPIDCredentialsInstance} = props;

  return (
    <GetPIDCredentialsContext.Provider value={{getPIDCredentialsInstance: customGetPIDCredentialsInstance ?? GetPIDCredentialsMachine.getInstance()}}>
      {children}
    </GetPIDCredentialsContext.Provider>
  );
};
