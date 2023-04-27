import {ScreenRoutesEnum} from '../types'
import {NativeStackNavigationProp} from '@react-navigation/native-stack'
import {navigationRef} from '../navigation/rootNavigation'
import {CommonActions} from '@react-navigation/routers'

/**
 * Filters routes from the QR navigation stack
 * @param navigation The navigation object
 * @param filter Routes to be filtered
 */
// FIXME currently we only look for the QRStack, this should become a param so we can define which stack we want to work with
export const filterNavigationStack = (navigation: NativeStackNavigationProp<any>, filter: Array<ScreenRoutesEnum>) => {
  const rootState = navigationRef.current?.getRootState();
  if (!rootState) {
    return
  }

  // TODO we need to make this a param
  const MainStack = rootState!.routes!.find((route: any) => route.name === 'Main')!.state
  const HomeStack = MainStack!.routes!.find((route: any) => route.name === 'Home').state
  const QRStack = HomeStack.routes.find((route: any) => route.name === 'QRStack').state

  const filteredRoutes = QRStack.routes.filter((route: any) => !filter.includes(route.name))

  navigation.dispatch(
    CommonActions.reset({
      index: filteredRoutes.length,
      routes: filteredRoutes.map((route: any) => ({ name: route.name, params: route.params }))
    }),
  );
};
