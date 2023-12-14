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
  onPress: () => void;
  style?: ViewStyle;
  backgroundColors?: Array<string>;
  captionColor?: string;
}

const SSIPrimaryButton: FC<Props> = (props: Props): JSX.Element => {
  // TODO color defaults?
  const {captionColor, backgroundColors = [], onPress, style, caption} = props;
  const disabled = typeof props.disabled === 'function' ? props.disabled() : props.disabled;

  // Setting minimal two colors for gradient
  if (backgroundColors.length === 1) {
    backgroundColors.push(backgroundColors[0]);
  }

  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      style={{
        ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
      }}>
      <LinearGradient {...(backgroundColors.length > 0 && {colors: backgroundColors})} style={{...style}}>
        <ButtonCaption style={{...(captionColor && {color: captionColor})}}>{caption}</ButtonCaption>
      </LinearGradient>
    </Button>
  );
};

export default SSIPrimaryButton;
