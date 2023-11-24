import React, {FC} from 'react';
import {PressableProps, ViewStyle} from 'react-native';

import {
  SSITouchableOpacityButtonFlexRowStyled as Button,
  SSITextH2LightStyled as ButtonCaption,
  SSIRoundedCenteredLinearGradientStyled as LinearGradient,
} from '../../../styles/components';
import {OpacityStyleEnum} from '../../../types';

export interface Props extends Omit<PressableProps, 'disabled'> {
  caption: string;
  disabled?: boolean | (() => boolean);
  onPress?: () => void;
  style?: ViewStyle;
}

const SSIPrimaryButton: FC<Props> = (props: Props): JSX.Element => {
  const {onPress, style, caption} = props;
  const disabled = typeof props.disabled === 'function' ? props.disabled() : props.disabled;

  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      style={{
        ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
      }}>
      <LinearGradient style={{...style}}>
        <ButtonCaption>{caption}</ButtonCaption>
      </LinearGradient>
    </Button>
  );
};

export default SSIPrimaryButton;
