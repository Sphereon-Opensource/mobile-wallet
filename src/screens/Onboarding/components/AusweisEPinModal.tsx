import {useState} from 'react';
import {Dimensions, LayoutChangeEvent, Image} from 'react-native';
import Animated, {useAnimatedKeyboard, useAnimatedStyle} from 'react-native-reanimated';
import {ContentContainer, IconContainer, ModalCard, ModalText, ModalTitle} from './styles';
import {PinInput} from '@pakenfit/react-native-pin-input';

const {width} = Dimensions.get('window');

type AusweisEPinModalProps = {
  initialValue?: string;
  visible: boolean;
  onComplete: (pin: string) => void;
  focusOnMount?: boolean;
};

export const AusweisEPinModal = (props: AusweisEPinModalProps) => {
  const {visible, onComplete, initialValue = '', focusOnMount} = props;
  const [containerHeight, setContainerHeight] = useState(200);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerHeight(e.nativeEvent.layout.height);
  };

  const keyboard = useAnimatedKeyboard();

  const transform = useAnimatedStyle(() => {
    // const bottom = withTiming(visible ? 20 : -containerHeight, {duration: 300, easing: Easing.cubic});
    return {
      position: 'absolute',
      paddingHorizontal: 20,
      width,
      bottom: 20,
      transform: [
        {
          translateY: -keyboard.height.value,
        },
      ],
    };
  });

  if (!visible) return null;

  return (
    <Animated.View onLayout={onLayout} style={transform}>
      <ModalCard>
        <IconContainer>
          <Image
            width={20}
            height={20}
            resizeMode="stretch"
            style={{width: 40, height: 40}}
            source={require('../../../assets/images/ausweis_icon.png')}
          />
        </IconContainer>
        <ModalTitle>Enter Ausweis eID pin</ModalTitle>
        <ModalText>Your pin code is unique to your card</ModalText>
        <ContentContainer>
          <PinInput
            inputStyle={{
              height: 50,
              width: 40,
              fontSize: 16,
            }}
            onFillEnded={onComplete}
            length={6}
            autoFocus
          />
        </ContentContainer>
      </ModalCard>
    </Animated.View>
  );
};
