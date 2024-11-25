import {fontColors} from '@sphereon/ui-components.core';
import {PressableProps} from 'react-native';
import styled from 'styled-components/native';
import {SSITextH3RegularLightStyled} from '../styles/components';
import ChevronIcon from './assets/icons/ChevronIcon';

const NavigationButtonContainer = styled.Pressable`
  width: 100%;
  padding: 24px 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

type NavigationButtonProps = PressableProps & {
  onPress: () => void;
  label: string;
};

export const NavigationButton = (props: NavigationButtonProps) => {
  const {onPress, label, disabled, ...pressableProps} = props;
  return (
    <NavigationButtonContainer
      accessibilityRole="link"
      onPress={onPress}
      style={({pressed}) => ({opacity: disabled ? 0.4 : pressed ? 0.7 : 1})}
      {...pressableProps}>
      <SSITextH3RegularLightStyled>{label}</SSITextH3RegularLightStyled>
      <ChevronIcon size={16} color={fontColors.light} style={{marginRight: 8, transform: [{rotate: '-90deg'}]}} />
    </NavigationButtonContainer>
  );
};
