import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useMemo, useState} from 'react';
import {Dimensions, Image, LayoutChangeEvent} from 'react-native';
import Animated, {Easing, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {ContentContainer, IconContainer, ModalCard, ModalText, ModalTitle, ProgressItem, ProgressItemActive, ProgressRow} from './styles';
import {EIDFlowState} from '../../../types';

const {width} = Dimensions.get('window');

// FIXME's
// 1 this modal shows a cancel button on the success state. but the success state should just be an animation that plays and close the modal after. we need a cancel button on the ready and scanning state
// 2 the design shows 2 progress balls per step not 1
// 3 color of balls, currently it is very hard to see the difference between the purple and grey. design shows blue. but we have a purple app. so maybe discuss with maria what color we should use and make it more prominent
// 4 overall design of modal. logo, text, balls, are mismatched in size and placing and design
// 5 placing of the modal should be at the bottom of the screen, not the middle, also would hide the button which would break the scanning flow if pressed

const STEPS = [20, 40, 60, 80, 100];

type AusweisScanModalProps = {
  state?: EIDFlowState; // FIXME in the future we need a general type for just NFC behavior
  progress?: number;
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
    const isVisible = state?.state === 'INSERT_CARD' || state?.state === 'READING_CARD' || state?.state === 'STARTED';
    const bottom = withTiming(isVisible ? 20 : -containerHeight, {duration: 500, easing: Easing.ease});
    return {
      position: 'absolute',
      paddingHorizontal: 20,
      bottom,
      width,
    };
  });

  const rowHeightTransform = useAnimatedStyle(() => {
    const showDots = state?.progress;
    const height = withTiming(showDots ? 30 : 0, {duration: 300, easing: Easing.ease});
    return {
      display: 'flex',
      overflow: 'hidden',
      height: height,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const showText = state?.state === 'SUCCESS';
    return {
      height: withTiming(showText ? 70 : 0, {duration: 300}),
      display: 'flex',
      width: '100%',
      flexDirection: 'row',
      overflow: 'hidden',
    };
  });
  const opacityStyle = useAnimatedStyle(() => {
    const showButton = state?.state === 'SUCCESS';
    return {
      opacity: withTiming(showButton ? 1 : 0, {duration: 300}),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };
  });

  const progressItems = useMemo(() => {
    if (state?.state === 'SUCCESS') return STEPS.map(_ => true);
    return STEPS.map(step => step <= (progress ?? 0));
  }, [state, progress]);

  const modalTitle = useMemo(() => {
    if (state?.state === 'INSERT_CARD' || state?.state === 'STARTED') return 'Ready to Scan'; //FIXME there is a small delay in the SDK starting and being ready for reading. i am not sure how we want to handle this in the UI
    if (state?.state === 'READING_CARD') return 'Scanning Document';
    return '';
  }, [state]);

  if (!state) return null;

  return (
    <Animated.View onLayout={onLayout} style={transform}>
      <ModalCard>
        {!!modalTitle && <ModalTitle>{modalTitle}</ModalTitle>}
        {state?.state !== 'SUCCESS' && (
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
        {state?.state === 'SUCCESS' && (
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
            <ProgressRow>
              {progressItems.map((active, index) => (active ? <ProgressItemActive key={index} /> : <ProgressItem key={index} />))}
            </ProgressRow>
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
