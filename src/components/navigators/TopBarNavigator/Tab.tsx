import {TouchableOpacity} from 'react-native';
import {SSITextH2LightStyled, SSITextH2SemiBoldLightStyled} from '../../../styles/components';
import {ParamsList} from '../../../types';

export type Props<T extends ParamsList> = {
  routeName: Extract<keyof T, string>;
  label: string;
  isFocused: boolean;
  onPress: () => void;
};

const Tab = <T extends ParamsList>({label, routeName, isFocused, onPress}: Props<T>) => {
  const TextComponent = isFocused ? SSITextH2SemiBoldLightStyled : SSITextH2LightStyled;
  return (
    <TouchableOpacity key={routeName} style={{flex: 1, alignItems: 'center'}} onPress={onPress}>
      <TextComponent>{label}</TextComponent>
    </TouchableOpacity>
  );
};

export default Tab;
