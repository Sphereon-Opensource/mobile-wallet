import Debug from 'debug';
import {AppState, DeviceEventEmitter, EmitterSubscription, NativeEventSubscription, Platform} from 'react-native';

import {APP_ID} from '../../@config/constants';
import RootNavigation from '../../navigation/rootNavigation';
import store from '../../store';
import {logout} from '../../store/actions/user.actions';
import {PlatformsEnum, ScreenRoutesEnum} from '../../types';

const debug: Debug.Debugger = Debug(`${APP_ID}:IntentHandler`);

class LockingHandler {
  private lockingEventListener: NativeEventSubscription | EmitterSubscription;

  public enableLocking = async (): Promise<void> => {
    debug('Enabling locking listener...');
    switch (Platform.OS) {
      case PlatformsEnum.IOS: {
        // TODO WAL-601, refactor locking mechanism
        const handleAppStateChange = async (nextAppState: string): Promise<void> => {
          if (nextAppState === 'background' || nextAppState === 'active') {
            if (this.isLockingRequiredForScreen()) {
              debug('Locking application...');
              await store.dispatch<any>(logout());
            }
          }
        };
        debug('Subscribing to locking event...');
        this.lockingEventListener = AppState.addEventListener('change', handleAppStateChange);
        break;
      }
      case PlatformsEnum.ANDROID: {
        const handleAppStateChange = (event: any): void => {
          if (event.event === 'appMovingToBackground') {
            debug('Locking application...');
            store.dispatch<any>(logout());
          }
        };
        debug('Subscribing to locking event...');
        this.lockingEventListener = DeviceEventEmitter.addListener('appStateChange', handleAppStateChange);
        break;
      }
      default: {
        const message = 'Unable to enable locking listener. OS type is not supported.';
        debug(message);
        return Promise.reject(Error(message));
      }
    }
  };

  // TODO WAL-601, remove function when refactoring iOS locking mechanism
  private isLockingRequiredForScreen(): boolean {
    return ScreenRoutesEnum.QR_READER !== RootNavigation.getCurrentRoute();
  }

  public disableLocking = async (): Promise<void> => {
    debug('Unsubscribing from locking event...');
    await this.lockingEventListener?.remove();
  };
}

export default LockingHandler;
