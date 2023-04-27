import {ScreenRoutesEnum} from '../types';
import {navigationRef} from '../navigation/rootNavigation';
import {CommonActions, NavigationState} from '@react-navigation/routers';
import {Route} from '@react-navigation/native';
import {filterNavigationStackArgs} from '../types/utils/navigationUtils';

/**
 * Filters routes from a navigation stack
 * @param navigation The navigation object
 * @param stack The navigation stack to apply filter to
 * @param filter Routes to be filtered
 */
export const filterNavigationStack = (args: filterNavigationStackArgs) => {
  const rootState: NavigationState | undefined = navigationRef.current?.getRootState();
  if (!rootState) {
    return;
  }

  const mainStack = rootState!.routes!.find((route: Route<string>) => route.name === 'Main')!.state;
  const homeStack = mainStack!.routes!.find((route: Route<string>) => route.name === 'Home').state;
  const currentStack = homeStack.routes.find((route: Route<string>) => route.name === args.stack).state;

  const filteredRoutes = currentStack.routes.filter((route: Route<ScreenRoutesEnum>) => !args.filter.includes(route.name));

  args.navigation.dispatch(
    CommonActions.reset({
      index: filteredRoutes.length,
      routes: filteredRoutes.map((route: Route<string>) => ({name: route.name, params: route.params})),
    }),
  );
};
