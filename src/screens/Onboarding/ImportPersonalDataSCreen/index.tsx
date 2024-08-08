import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {buttonColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {styled} from 'styled-components/native';
import {ScreenRoutesEnum, StackParamList} from '../../../types';
import {translate} from 'src/localization/Localization';
import Animated, {Easing, useAnimatedKeyboard, useAnimatedStyle, useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';
import {Dimensions, TextInput, Image, Keyboard, LayoutChangeEvent, Button} from 'react-native';
import {useCallback, useEffect, useRef, useState} from 'react';
import {PinInput, PinInputRef} from '@pakenfit/react-native-pin-input';

const {width} = Dimensions.get('window');

const Container = styled.View`
  position: relative;
  flex: 1;
  display: flex;
  background-color: #202537;
  align-items: stretch;
  justify-content: flex-start;
  padding-bottom: 20px;
`;

const TitleContainer = styled.View`
  display: flex;
  align-items: stretch;
  padding: 10px 20px;
`;

const ContentContainer = styled.Pressable`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 20px;
  background-color: transparent;
  padding: 0px 20px;
`;

const ButtonContainer = styled(TitleContainer)`
  align-items: center;
  justify-content: center;
`;

const Text = styled.Text`
  color: white;
  font-size: 18px;
`;

const Title = styled(Text)`
  font-size: 24px;
  font-weight: bold;
`;

const ModalTitle = styled(Text)`
  font-size: 16px;
  color: slategray;
  text-align: center;
`;

const ModalText = styled(Text)`
  color: darkgray;
  font-size: 12px;
  text-align: center;
  margin-bottom: 10px;
`;

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.IMPORT_DATA>;

const ImportPersonalDataScreen = (props: Props) => {
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [scanning, setScanning] = useState(false);

  const transition = useCallback(() => {
    if (scanning) return setScanning(false);
    if (showPin) {
      setShowPin(false);
      setScanning(true);
      return;
    }
    setShowPin(true);
  }, [scanning, setScanning, showPin, setShowPin]);

  const onCompletePin = (pin: string) => {
    setPin(pin);
    transition();
  };

  return (
    <Container>
      <TitleContainer>
        <Title>{translate('scan_card_step_title')}</Title>
        <Text>{translate('scan_card_step_subtitle')}</Text>
      </TitleContainer>
      <ContentContainer
        onPress={() => {
          setShowPin(false);
          Keyboard.dismiss();
        }}>
        <Image source={require('../../../assets/images/scan_card.png')} height={200} width={100} style={{height: 300, width: 200}} />
      </ContentContainer>
      <ButtonContainer>
        <PrimaryButton
          style={{height: 42, width: 300}}
          caption="Next"
          backgroundColors={['#7276F7', '#7C40E8']}
          captionColor={fontColors.light}
          onPress={() => transition()}
        />
      </ButtonContainer>
      <AusweisEPinModal focusOnMount visible={showPin} onComplete={onCompletePin} />
      <AusweisScanModal
        onScan={() => console.log('scanning')}
        onCancel={() => setScanning(false)}
        visible={scanning}
        onComplete={() => setScanning(false)}
      />
    </Container>
  );
};

const ModalCard = styled.View`
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0px 0px 2px black;

  display: flex;
  align-items: stretch;

  background-color: white;
`;

const IconContainer = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

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

const ProgressRow = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10;
  margin-top: 10px;
`;

const ProgressItem = styled.View`
  width: 10;
  height: 10;
  background-color: slategrey;
  border-radius: 5px;
`;

const ProgressItemActive = styled(ProgressItem)`
  background-color: slateblue;
`;

type AusweisScanModalProps = {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
  onScan: () => void;
};

export const AusweisScanModal = (props: AusweisScanModalProps) => {
  const {onComplete, onCancel, onScan, visible} = props;
  const [containerHeight, setContainerHeight] = useState(200);
  // const [scanning, setScanning] = useState(false);
  const scanning = useSharedValue(false);

  const [progress, setProgress] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerHeight(e.nativeEvent.layout.height);
  };

  const onChange = (progress: number) => {
    if (progress >= 80) {
      setTimeout(() => {
        onComplete();
      }, 400);
    }
  };

  const transform = useAnimatedStyle(() => {
    const bottom = withTiming(visible ? 20 : -containerHeight, {duration: 500, easing: Easing.ease});
    return {
      position: 'absolute',
      paddingHorizontal: 20,
      bottom,
      width,
    };
  });

  const rowHeightTransform = useAnimatedStyle(() => {
    const height = withTiming(scanning.value ? 30 : 0, {duration: 300, easing: Easing.cubic});
    console.log('running height', height);
    return {
      display: 'flex',
      overflow: 'hidden',
      height: height,
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
            style={{width: 60, height: 60}}
            source={require('../../../assets/images/scan_icon.png')}
          />
        </IconContainer>
        <ContentContainer>
          <ModalText>Keep your phone on top of your card. Hold in place until the reading is done. </ModalText>
          <Animated.View style={rowHeightTransform}>
            <ProgressRow>
              <ProgressItemActive />
              <ProgressItem />
              <ProgressItem />
              <ProgressItem />
              <ProgressItem />
            </ProgressRow>
          </Animated.View>
        </ContentContainer>
        <ButtonContainer>
          <Button
            title="start scan"
            onPress={() => {
              console.log('scan scan');
              scanning.value = true;
            }}></Button>
          <PrimaryButton
            style={{height: 42, width: 300}}
            caption="Cancel"
            backgroundColors={['#6f6f75']}
            captionColor={fontColors.light}
            onPress={() => {
              scanning.value = false;
              onCancel();
            }}
          />
        </ButtonContainer>
      </ModalCard>
    </Animated.View>
  );
};

export default ImportPersonalDataScreen;
