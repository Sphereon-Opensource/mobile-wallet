import Debug from 'debug';

import {APP_ID} from '../../@config/constants';

const debug = Debug(`${APP_ID}:IntentHandler`);
import {AppState} from 'react-native';
import {NativeEventSubscription} from 'react-native/Libraries/EventEmitter/RCTNativeAppEventEmitter';

import store from '../../store';
import {logout} from '../../store/actions/user.actions';

class LockingHandler {
  private lockingEventListener: NativeEventSubscription;

  public enableLocking = async (): Promise<void> => {
    const handleAppStateChange = async (nextAppState: string): Promise<void> => {
      if (nextAppState === 'background' || nextAppState === 'active') {
        debug('Locking application...');
        await store.dispatch<any>(logout());
      }
    };

    AppState.addEventListener('change', handleAppStateChange);
  };

  public disableLocking = async (): Promise<void> => {
    await this.lockingEventListener?.remove();
  };
}

export default LockingHandler;
