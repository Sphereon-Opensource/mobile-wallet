import {SSITextH3LightStyled} from '@sphereon/ui-components.ssi-react-native';
import {useEffect} from 'react';
import {TouchableOpacity, TouchableOpacityProps, ViewStyle} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import {Accordion} from './Accordion';

export type CardConfig = {
  title: string;
  style?: ViewStyle;
};

type Props = CardConfig & {
  isExpanded: boolean;
  onPress: TouchableOpacityProps['onPress'];
};

export const Card = ({title, isExpanded, onPress, style = {}}: Props) => {
  const _isExpanded = useSharedValue(isExpanded);
  useEffect(() => {
    _isExpanded.value = isExpanded;
  }, [isExpanded]);

  return (
    <TouchableOpacity onPress={onPress} style={[{borderRadius: 16}, style]}>
      <Accordion isExpanded={_isExpanded} viewKey={`card_${title}`} style={{width: '100%'}}>
        <SSITextH3LightStyled>{title}</SSITextH3LightStyled>
      </Accordion>
    </TouchableOpacity>
  );
};
