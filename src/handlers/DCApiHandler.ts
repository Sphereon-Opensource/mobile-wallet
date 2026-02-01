import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
import {NavigationBarRoutesEnum} from '../types';
import {navigationRef} from '../navigation/rootNavigation';

const TAG = '[DC API Handler]';
const DCApiModule = Platform.OS === 'android' ? NativeModules.DCApiModule : null;

let unsubscribe: (() => void) | null = null;

export function startDCApiHandler(): void {
  if (Platform.OS !== 'android' || !DCApiModule) {
    return;
  }
  if (unsubscribe) {
    return;
  }
  console.log(TAG, 'Starting DC API handler');
  const emitter = new NativeEventEmitter(DCApiModule);
  const subscription = emitter.addListener('onDCApiComplete', () => {
    console.log(TAG, 'DC API flow completed, navigating to credentials');
    if (navigationRef.isReady()) {
      navigationRef.navigate(NavigationBarRoutesEnum.CREDENTIALS as never);
    }
  });
  unsubscribe = () => subscription.remove();
}

export function stopDCApiHandler(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
