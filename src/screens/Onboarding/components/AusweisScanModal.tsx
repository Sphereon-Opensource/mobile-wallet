import {useContext, useEffect, useState} from 'react';
import {Button, Dimensions, LayoutChangeEvent, Image} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {ButtonContainer, ContentContainer, IconContainer, ModalCard, ModalText, ProgressItem, ProgressItemActive, ProgressRow} from './styles';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {fontColors} from '@sphereon/ui-components.core';
import {OnboardingContext} from 'src/navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from 'src/types/machines/onboarding';

const {width} = Dimensions.get('window');

type AusweisScanModalProps = {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
  onScan: () => void;
};

export const AusweisScanModal = (props: AusweisScanModalProps) => {
  const {onComplete, onCancel, visible} = props;
  const [containerHeight, setContainerHeight] = useState(200);
  // const [scanning, setScanning] = useState(false);
  const scanning = useSharedValue(false);

  const [progress, setProgress] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerHeight(e.nativeEvent.layout.height);
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
    const height = withTiming(scanning.value ? 30 : 0, {duration: 300, easing: Easing.ease});
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
            title={'end scan'}
            onPress={() => {
              onComplete();
            }}
          />
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
