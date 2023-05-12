import Debug from 'debug';
import {AppState} from 'react-native';
import {NativeEventSubscription} from 'react-native/Libraries/EventEmitter/RCTNativeAppEventEmitter';

import {APP_ID} from '../../@config/constants';
import RootNavigation from '../../navigation/rootNavigation';
import store from '../../store';
import {logout} from '../../store/actions/user.actions';
import {ScreenRoutesEnum} from '../../types';

const debug = Debug(`${APP_ID}:IntentHandler`);

class LockingHandler {
  private lockingEventListener: NativeEventSubscription;

  public enableLocking = async (): Promise<void> => {
    const handleAppStateChange = async (nextAppState: string): Promise<void> => {
      if (nextAppState === 'background' || nextAppState === 'active') {
        if (this.isLockingRequiredForScreen()) {
          debug('Locking application...');
          await store.dispatch<any>(logout());
        }
      }
    };

    AppState.addEventListener('change', handleAppStateChange);
  };

  private isLockingRequiredForScreen() {
    return ScreenRoutesEnum.QR_READER !== RootNavigation.getCurrentRoute();
  }

  public disableLocking = async (): Promise<void> => {
    await this.lockingEventListener?.remove();
  };
}

export default LockingHandler;
