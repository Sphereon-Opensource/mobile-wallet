import {Pressable} from 'react-native';
import {Circle, SSITextH3RegularLightStyled, SelectedCircle} from '../../../styles/components';
import {capitalize} from '../../../utils';

type Props = {
  label: string;
  selected: boolean;
  onPress: (() => void) | (() => Promise<void>);
  disabled?: boolean;
};

const SelectOption = ({selected, onPress, label, disabled}: Props) => {
  const handlePress = () => {
    if (disabled) return;
    onPress();
  };
  return (
    <Pressable
      onPress={handlePress}
      style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingHorizontal: 5, opacity: disabled ? 0.7 : 1}}>
      <SSITextH3RegularLightStyled>{capitalize(label)}</SSITextH3RegularLightStyled>
      <Circle>{selected && <SelectedCircle />}</Circle>
    </Pressable>
  );
};

export default SelectOption;
