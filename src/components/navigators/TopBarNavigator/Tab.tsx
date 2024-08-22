import {TouchableOpacity} from 'react-native';
import {ParamsList} from '../../../types';

export type Props<T extends ParamsList> = {
  routeName: Extract<keyof T, string>;
  isFocused: boolean;
  renderLabel: (isFocused: boolean) => JSX.Element;
  onPress: () => void;
};

const Tab = <T extends ParamsList>({renderLabel, routeName, isFocused, onPress}: Props<T>) => {
  return (
    <TouchableOpacity key={routeName} style={{flex: 1, alignItems: 'center', zIndex: 1}} onPress={onPress}>
      {renderLabel(isFocused)}
    </TouchableOpacity>
  );
};

export default Tab;
