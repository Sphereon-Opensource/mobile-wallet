import React, {FC} from 'react';
import {ColorValue, PressableProps, View, ViewStyle} from 'react-native';

import {backgrounds} from '../../../styles/colors';
import {
  SSIRoundedContainerBackgroundSecondaryDarkStyled as Background,
  SSITouchableOpacityButtonFlexRowStyled as Button,
  SSITextH2SecondaryButtonStyled as ButtonCaption,
  SSISecondaryButtonContainerStyled as ButtonContainer,
  SSIRoundedCenteredLinearGradientSecondaryButtonStyled as LinearGradient,
  SSITextH2SecondaryButtonStyled,
  SSIRoundedCenteredLinearGradientSecondaryButtonStyled,
  SSILinearGradientStyled,
} from '../../../styles/components';
import {OpacityStyleEnum} from '../../../types';
import MaskedView from '@react-native-masked-view/masked-view';

export interface Props extends Omit<PressableProps, 'disabled'> {
  caption: string;
  disabled?: boolean | (() => boolean);
  onPress: () => void;
  style?: ViewStyle;
  borderColors?: Array<string>;
  captionColor?: string;
}

const SSISecondaryButton: FC<Props> = (props: Props): JSX.Element => {
  // TODO color defaults?
  const {caption, captionColor, borderColors = [], onPress, style} = props;
  const disabled = typeof props.disabled === 'function' ? props.disabled() : props.disabled;

  // Setting minimal two colors for gradient
  if (borderColors.length === 1) {
    borderColors.push(borderColors[0]);
  }

  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.5}
      style={{
        ...style,
        ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
      }}>
      <MaskedView
        style={{flex: 1}}
        maskElement={
          <View
            style={{
              backgroundColor: 'transparent',
              //width: '100%', height: '100%',
              flex: 1,
              borderWidth: 1,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <SSITextH2SecondaryButtonStyled>{caption}</SSITextH2SecondaryButtonStyled>
          </View>
        }>
        <SSILinearGradientStyled
          {...(borderColors.length > 0 && {colors: borderColors})}
          style={{
            flex: 1,
            // height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <SSITextH2SecondaryButtonStyled style={{...(captionColor && {color: captionColor})}}>{caption}</SSITextH2SecondaryButtonStyled>
        </SSILinearGradientStyled>
      </MaskedView>
    </Button>
    // <Background>
    //   <Button
    //     onPress={onPress}
    //     disabled={disabled}
    //     activeOpacity={0.5}
    //     style={{
    //       ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
    //     }}>
    //     <LinearGradient style={{...style}}>
    //       <ButtonContainer style={{backgroundColor: style?.backgroundColor ? style?.backgroundColor : backgrounds.primaryDark}}>
    //         <ButtonCaption>{caption}</ButtonCaption>
    //       </ButtonContainer>
    //     </LinearGradient>
    //   </Button>
    // </Background>
  );
};

export default SSISecondaryButton;
