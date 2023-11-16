import {createNavigationContainerRef} from '@react-navigation/native';
import type {NavigationAction, NavigationState, PartialState} from '@react-navigation/routers';

import {StackParamList} from '../types';

export const navigationRef = createNavigationContainerRef<StackParamList>();

// TODO fix missing type / refactor to correct version of @react-navigation
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const RootNavigation: NavigationHelpersCommon<StackParamList, NavigationState> = {
  dispatch: (action: NavigationAction | ((state: NavigationState) => NavigationAction)) => navigationRef.current?.dispatch(action),
  navigate: (...args: any) => navigationRef.current?.navigate(...args),
  reset: (state: PartialState<NavigationState> | NavigationState) => navigationRef.current?.reset(state),
  goBack: () => navigationRef.current?.goBack(),
  isFocused: () => navigationRef.current?.isFocused(),
  canGoBack: () => navigationRef.current?.canGoBack(),
  getId: () => navigationRef.current?.getRootState().routeNames.join(),
  getParent: (id?: string) => navigationRef.current?.getParent(id),
  getState: () => navigationRef.current?.getRootState() as NavigationState<StackParamList>,
  getCurrentRoute: () => navigationRef.current?.getCurrentRoute()?.name,
  isReady: () => navigationRef.isReady(),
};

export default RootNavigation;
