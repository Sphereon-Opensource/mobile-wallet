import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {NavigationBarRoutesEnum, ScreenRoutesEnum} from '../../navigation';

export interface filterNavigationStackArgs {
  navigation: NativeStackNavigationProp<any>;
  stack: NavigationBarRoutesEnum;
  filter: Array<ScreenRoutesEnum>;
}
