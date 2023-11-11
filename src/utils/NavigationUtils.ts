import {ParamListBase, PartialRoute, Route} from '@react-navigation/native';
import {CommonActions, NavigationState} from '@react-navigation/routers';
import {navigationRef} from '../navigation/rootNavigation';

import {filterNavigationStackArgs, ScreenRoutesEnum} from '../types';

/**
 * Filters routes from a navigation stack
 * @param {Object} args - The arguments for filtering navigation stack
 * @param {NativeStackNavigationProp<any>} args.navigation - The navigation object
 * @param {NavigationBarRoutesEnum} args.stack - The navigation stack to apply filter to
 * @param {Array<ScreenRoutesEnum>} args.filter - Routes to be filtered
 * @returns {void}
 */
export const filterNavigationStack = (args: filterNavigationStackArgs): void => {
  const rootState: NavigationState | undefined = navigationRef.current?.getRootState();
  if (!rootState?.routes) {
    return;
  }

  const mainStack = rootState.routes.find((route: Route<string>) => route.name === 'Main')?.state;
  if (!mainStack?.routes) {
    return;
  }
  // @ts-ignore
  const homeStack = mainStack.routes.find((route: Route<string>) => route.name === 'Home').state;
  const currentStack = homeStack.routes.find((route: Route<string>) => route.name === args.stack).state;

  if (!currentStack) {
    return;
  }

  const filteredRoutes = currentStack.routes.filter((route: Route<ScreenRoutesEnum>) => !args.filter.includes(route.name));

  args.navigation.dispatch(
    CommonActions.reset({
      index: filteredRoutes.length, // Sets the last route in the stack as the current route
      routes: filteredRoutes.map((route: Route<string>) => ({name: route.name, params: route.params})),
    }),
  );
};
