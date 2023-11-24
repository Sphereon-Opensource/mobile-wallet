import Debug, {Debugger} from 'debug';
import {AppState, DeviceEventEmitter, EmitterSubscription, NativeEventSubscription, Platform} from 'react-native';

import {APP_ID} from '../../@config/constants';
import RootNavigation from '../../navigation/rootNavigation';
import store from '../../store';
import {logout} from '../../store/actions/user.actions';
import {PlatformsEnum, ScreenRoutesEnum} from '../../types';

const debug: Debugger = Debug(`${APP_ID}:LockingHandler`);

class LockingHandler {
  private static instance: LockingHandler;
  private _isLocked = false;
  private lockingEventListener: NativeEventSubscription | EmitterSubscription;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): LockingHandler {
    if (!LockingHandler.instance) {
      LockingHandler.instance = new LockingHandler();
    }
    return LockingHandler.instance;
  }

  public enableLocking = async (): Promise<void> => {
    debug('Enabling locking listener...');
    switch (Platform.OS) {
      case PlatformsEnum.IOS: {
        // TODO WAL-601, refactor locking mechanism
        const handleAppStateChange = async (nextAppState: string): Promise<void> => {
          if (nextAppState === 'background' || nextAppState === 'active') {
            if (this.isLockingRequiredForScreen()) {
              if (this._isLocked) {
                debug('Application was already locked');
                return;
              }
              debug('Locking application...');
              this.isLocked = true;
              await store.dispatch<any>(logout());
              return;
            }
          }
          this.isLocked = false;
        };
        debug('Subscribing to locking event...');
        this.lockingEventListener = AppState.addEventListener('change', handleAppStateChange);
        break;
      }
      case PlatformsEnum.ANDROID: {
        const handleAppStateChange = (event: any): void => {
          if (event.event === 'appMovingToBackground') {
            if (this.isLocked) {
              debug('Application was already locked');
              return;
            }
            debug('Locking application...');
            this.isLocked = true;
            store.dispatch<any>(logout());
          } else {
            debug('Not locking for event: ' + JSON.stringify(event));
            this.isLocked = false;
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
    this.lockingEventListener?.remove();
  };

  get isLocked(): boolean {
    return this._isLocked;
  }

  set isLocked(value: boolean) {
    this._isLocked = value;
  }
}

export default LockingHandler;
