import React, {FC} from 'react';
import {PressableProps, ViewStyle} from 'react-native';

import {backgrounds} from '../../../styles/colors';
import {
  SSIRoundedContainerBackgroundSecondaryDarkStyled as Background,
  SSITouchableOpacityButtonFlexRowStyled as Button,
  SSITextH2SecondaryButtonStyled as ButtonCaption,
  SSISecondaryButtonContainerStyled as ButtonContainer,
  SSIRoundedCenteredLinearGradientSecondaryButtonStyled as LinearGradient,
} from '../../../styles/components';
import {OpacityStyleEnum} from '../../../types';

export interface Props extends Omit<PressableProps, 'disabled'> {
  caption: string;
  disabled?: boolean | (() => boolean);
  onPress?: () => void;
  style?: ViewStyle;
}

const SSISecondaryButton: FC<Props> = (props: Props): JSX.Element => {
  const {caption, onPress, style} = props;
  const disabled = typeof props.disabled === 'function' ? props.disabled() : props.disabled;

  return (
    <Background>
      <Button
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.5}
        style={{
          ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
        }}>
        <LinearGradient style={{...style}}>
          <ButtonContainer style={{backgroundColor: style?.backgroundColor ? style?.backgroundColor : backgrounds.primaryDark}}>
            <ButtonCaption>{caption}</ButtonCaption>
          </ButtonContainer>
        </LinearGradient>
      </Button>
    </Background>
  );
};

export default SSISecondaryButton;
