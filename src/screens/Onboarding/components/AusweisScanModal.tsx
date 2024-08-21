import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useMemo, useState} from 'react';
import {Button, Dimensions, Image, LayoutChangeEvent} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {ContentContainer, IconContainer, ModalCard, ModalText, ModalTitle, ProgressItem, ProgressItemActive, ProgressRow} from './styles';

const {width} = Dimensions.get('window');

export enum ScanEvents {
  READY = 'ready',
  SCAN = 'scan',
  COMPLETE = 'complete',
  NONE = 'none',
}

const STEPS = [20, 40, 60, 80, 100];

type AusweisScanModalProps = {
  state: ScanEvents;
  progress: number;
  onCancel: () => void;
  onProgress?: () => void;
};

export const AusweisScanModal = (props: AusweisScanModalProps) => {
  const {state, progress, onCancel} = props;
  const [containerHeight, setContainerHeight] = useState(200);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerHeight(e.nativeEvent.layout.height);
  };

  const transform = useAnimatedStyle(() => {
    const isVisible = state !== ScanEvents.NONE;
    const bottom = withTiming(isVisible ? 20 : -containerHeight, {duration: 500, easing: Easing.ease});
    return {
      position: 'absolute',
      paddingHorizontal: 20,
      bottom,
      width,
    };
  });

  const rowHeightTransform = useAnimatedStyle(() => {
    const showDots = state === ScanEvents.SCAN || state === ScanEvents.COMPLETE;
    const height = withTiming(showDots ? 30 : 0, {duration: 300, easing: Easing.ease});
    return {
      display: 'flex',
      overflow: 'hidden',
      height: height,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const showText = state !== ScanEvents.COMPLETE;
    return {
      height: withTiming(showText ? 70 : 0, {duration: 300}),
      display: 'flex',
      width: '100%',
      flexDirection: 'row',
      overflow: 'hidden',
    };
  });
  const opacityStyle = useAnimatedStyle(() => {
    const showButton = state !== ScanEvents.COMPLETE;
    return {
      opacity: withTiming(showButton ? 1 : 0, {duration: 300}),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };
  });

  const progressItems = useMemo(() => {
    if (state === ScanEvents.COMPLETE) return STEPS.map(_ => true);
    return STEPS.map(step => step <= progress);
  }, [state, progress]);

  const modalTitle = useMemo(() => {
    if (state === ScanEvents.READY) return 'Ready to Scan';
    if (state === ScanEvents.SCAN) return 'Scanning Document';
    return '';
  }, [state]);

  if (state === ScanEvents.NONE) return null;

  return (
    <Animated.View onLayout={onLayout} style={transform}>
      <ModalCard>
        {!!modalTitle && <ModalTitle>{modalTitle}</ModalTitle>}
        {state !== ScanEvents.COMPLETE && (
          <IconContainer>
            <Image
              width={30}
              height={30}
              resizeMode="stretch"
              style={{width: 100, height: 100}}
              source={require('../../../assets/images/scan_icon.png')}
            />
          </IconContainer>
        )}
        {state === ScanEvents.COMPLETE && (
          <IconContainer>
            <Image
              width={30}
              height={30}
              resizeMode="stretch"
              style={{width: 100, height: 100}}
              source={require('../../../assets/images/scan-success.png')}
            />
          </IconContainer>
        )}
        <ContentContainer>
          <Animated.View style={textStyle}>
            <ModalText>Keep your phone on top of your card. Hold in place until the reading is done. </ModalText>
          </Animated.View>
          <Animated.View style={rowHeightTransform}>
            <ProgressRow>{progressItems.map(active => (active ? <ProgressItemActive /> : <ProgressItem />))}</ProgressRow>
          </Animated.View>
        </ContentContainer>
        <Animated.View style={opacityStyle}>
          <PrimaryButton
            style={{height: 42, width: 300}}
            caption="Cancel"
            backgroundColors={['#6f6f75']}
            captionColor={fontColors.light}
            onPress={onCancel}
          />
        </Animated.View>
      </ModalCard>
    </Animated.View>
  );
};
