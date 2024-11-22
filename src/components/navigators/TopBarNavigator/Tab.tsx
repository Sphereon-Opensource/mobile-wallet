import {TouchableOpacity} from 'react-native';
import {ParamsList} from '../../../types';

export type Props<T extends ParamsList> = {
  isFocused: boolean;
  renderLabel: (isFocused: boolean) => JSX.Element;
  onPress: () => void;
  accessibilityLabel?: string;
};

const Tab = <T extends ParamsList>({renderLabel, isFocused, onPress, accessibilityLabel}: Props<T>) => {
  return (
    <TouchableOpacity
      style={{flex: 1, alignItems: 'center'}}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{selected: isFocused}}>
      {renderLabel(isFocused)}
    </TouchableOpacity>
  );
};

export default Tab;
