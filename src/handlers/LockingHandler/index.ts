import Debug, {Debugger} from 'debug';
import moment from 'moment';
import {AppState, DeviceEventEmitter, EmitterSubscription, NativeEventSubscription, Platform} from 'react-native';

import {APP_ID} from '../../@config/constants';
import {navigationRef} from '../../navigation/rootNavigation';
import store from '../../store';
import {logout} from '../../store/actions/user.actions';
import {PlatformsEnum, ScreenRoutesEnum} from '../../types';

const debug: Debugger = Debug(`${APP_ID}:LockingHandler`);
const IDLE_LOGOUT_AFTER = 5 * 60 * 1000; // 5 minutes logout
class LockingHandler {
  private static instance: LockingHandler;
  private _isLocked = true;
  // We initialize in the past making sure we have passed the threshold, to make sure we remain locked initially
  private lastInteraction = new Date(Date.now() - 2 * IDLE_LOGOUT_AFTER);

  private lockingEventListener: NativeEventSubscription | EmitterSubscription;
  private constructor() {
    navigationRef.addListener('__unsafe_action__', () => this.touchLastInteraction());
  }

  private checkInactive() {
    if (this.isInactive()) {
      return this.lock();
    }
    this.isLocked = false;
  }

  public isInactive(): boolean {
    if (this.isLocked) {
      return true;
    }
    const currentTime = moment();
    const elapsed = moment(currentTime).diff(this.lastInteraction);
    const isInactive = elapsed > IDLE_LOGOUT_AFTER;
    if (isInactive) {
      debug(`needs locking, as ${elapsed / 1000} seconds have passed (limit: ${IDLE_LOGOUT_AFTER / 1000})`);
    }
    return isInactive;
  }

  public touchLastInteraction() {
    if (this.isLocked) {
      return;
    }
    this.lastInteraction = new Date();
  }

  public static getInstance(): LockingHandler {
    if (!LockingHandler.instance) {
      LockingHandler.instance = new LockingHandler();
    }
    return LockingHandler.instance;
  }

  public enableLocking = async (): Promise<void> => {
    debug('Enabling locking listener...');
    switch (Platform.OS) {
      case PlatformsEnum.ANDROID:
      case PlatformsEnum.IOS: {
        const handleAppStateChange = async (nextAppState: string): Promise<void> => {
          if (nextAppState === 'background' || nextAppState === 'active') {
            if (Platform.OS === PlatformsEnum.IOS && this.isLockingRequiredForScreen()) {
              return this.checkInactive();
            } else {
              return this.checkInactive();
            }
          } else if (this.isInactive()) {
            return this.lock();
          }
          this.touchLastInteraction();
          this.isLocked = false;
        };
        debug('Subscribing to locking event...');
        this.lockingEventListener = AppState.addEventListener('change', handleAppStateChange);
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
    return ScreenRoutesEnum.QR_READER !== navigationRef.current?.getCurrentRoute()?.name;
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

  private lock() {
    if (this.isLocked) {
      debug('Application was already locked');
      return;
    }
    debug('Locking application...');
    this.isLocked = true;
    store.dispatch<any>(logout());
  }
}

export default LockingHandler;
