import Debug, {Debugger} from 'debug';
import React, {Context, createContext, useEffect, useMemo} from 'react';
import {Platform, StatusBar} from 'react-native';
import {InterpreterStatus} from 'xstate';
import {APP_ID} from '../../@config/constants';
import {ShareMachine} from '../../machines/shareMachine';
import {
  ShareContext as ShareContextType,
  ShareMachineContext,
  ShareMachineEvents,
  ShareMachineInterpreter,
  ShareMachineState,
  ShareMachineStateType,
} from '../../types/machines/share';
import {ShareStack} from '../navigation';
import RootNavigation from '../rootNavigation';

const debug: Debugger = Debug(`${APP_ID}:shareStateNavigation`);

export const ShareContext: Context<ShareContextType> = createContext({} as ShareContextType);

export const shareStateNavigationListener = (shareMachine: ShareMachineInterpreter, state: ShareMachineState): void => {
  if (state._event.type === 'internal') {
    // Make sure we do not navigate when triggered by an internal event. We need to stay on current screen
    // Make sure we do not navigate when state has not changed
    return;
  }
  const context: ShareMachineContext = shareMachine.getSnapshot().context;
  const relyingParty = context.credentialRequest?.relyingParty ?? 'UNKOWN_PARTY';
  const shareFailed = context.shareCredentialsError;
  const navigation = RootNavigation;
  if (navigation === undefined || !navigation.isReady()) {
    debug(`navigation not ready yet`);
    return;
  }

  // TODO: Fix type casting, properly get access to the navigation object
  switch (state.value) {
    case ShareMachineStateType.scanQr:
      navigation.navigate('ScanQr', {});
      break;
    case ShareMachineStateType.getCredentialsRequestLoading:
      navigation.navigate('QrLoading', {message: 'Getting information'});
      break;
    case ShareMachineStateType.selectCredentials:
      navigation.navigate('SelectCredentials', {});
      break;
    case ShareMachineStateType.shareCredentialsLoading:
      navigation.navigate('ShareLoading', {message: 'Sharing credentials...'});
      break;
    case ShareMachineStateType.verifyPinCode:
      navigation.navigate('VerifyPinCode', {});
      break;
    case ShareMachineStateType.credentialsShared:
      navigation.navigate('CredentialsStack', {
        screen: 'CredentialsOverview',
        params: {
          crerentialsShared: {
            success: !shareFailed,
            relyingParty,
          },
        },
      });
      break;
    default:
      throw new Error(`Navigation for ${JSON.stringify(state)} is not implemented!`); // Should not happen, so we throw an error
  }
};

export const ShareProvider = () => {
  const shareInstance: ShareMachineInterpreter = useMemo(
    () =>
      ShareMachine.hasInstance()
        ? ShareMachine.getInstance({requireCustomNavigationHook: false})
        : ShareMachine.getInstance({requireExisting: false}),
    [ShareMachine.hasInstance()],
  );

  const isAndroid = Platform.OS === 'android';
  useEffect(() => {
    if (shareInstance === undefined) {
      return;
    }
    if (shareInstance.status !== InterpreterStatus.Running) {
      debug(`SHARE MACHINE starting...`);
      shareInstance.start();
      debug(`SHARE MACHINE started`);
    } else {
      const {value, context} = shareInstance.getSnapshot();
      debug(`SHARE MACHINE already running...`);
      if (value !== 'scanQr' && value !== 'sharedCredentials') {
        debug(`Resetting SHARE MACHINE...`);
        shareInstance.send(ShareMachineEvents.RESET);
      }
    }
  }, [shareInstance, shareInstance?.status]);
  return (
    <ShareContext.Provider value={{shareInstance: shareInstance ?? ShareMachine.getInstance({requireExisting: false})}}>
      {isAndroid ? <StatusBar backgroundColor="transparent" barStyle="light-content" translucent /> : null}
      <ShareStack />
    </ShareContext.Provider>
  );
};
