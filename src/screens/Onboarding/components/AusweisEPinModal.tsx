import {PinInput, PinInputRef} from '@pakenfit/react-native-pin-input';
import {Image, Platform, TextInput, View} from 'react-native';
import Modal from 'react-native-modal';
import {SSITextH1RegularStyled, SSITextH3RegularStyled} from '../../../styles/components';
import {ContentContainer, IconContainer, ModalCard} from './styles';
import {useEffect, useRef, useState} from 'react';
import Animated, {Easing, useAnimatedKeyboard, useAnimatedStyle, withTiming} from 'react-native-reanimated';

type AusweisEPinModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (pin: string) => void;
};

export const AusweisEPinModal = ({isVisible, onClose, onComplete}: AusweisEPinModalProps) => {
  const ref = useRef<TextInput>(null);

  const keyboard = useAnimatedKeyboard();

  const style = useAnimatedStyle(() => {
    const bottom = withTiming(isVisible ? 0 : -250, {duration: 300, easing: Easing.ease});
    console.log('bottom', bottom);
    return {
      position: 'absolute',
      alignSelf: 'center',
      bottom,
      transform: [
        {
          translateY: -keyboard.height.value,
        },
      ],
    };
  });

  if (!isVisible) return null;

  return (
    <Animated.View style={style}>
      <ModalCard style={{width: '100%'}}>
        <IconContainer>
          <Image
            width={20}
            height={20}
            resizeMode="stretch"
            style={{width: 40, height: 40}}
            source={require('../../../assets/images/ausweis_icon.png')}
          />
        </IconContainer>
        <View style={{alignItems: 'center'}}>
          <SSITextH1RegularStyled style={{color: '#8F8E94'}}>Enter Ausweis eID pin</SSITextH1RegularStyled>
          <SSITextH3RegularStyled>Your pin code is unique to your card</SSITextH3RegularStyled>
        </View>
        <ContentContainer>
          <PinInput
            containerStyle={{marginBottom: 10}}
            ref={ref}
            inputProps={{placeholder: '', caretHidden: true, secureTextEntry: true}}
            inputStyle={{
              height: 50,
              width: 40,
              fontSize: 16,
            }}
            onFillEnded={onComplete}
            length={6}
            autoFocus={true}
          />
        </ContentContainer>
      </ModalCard>
    </Animated.View>
  );
};
