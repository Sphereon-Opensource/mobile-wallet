import React, { FC, ReactElement, useRef, useState } from 'react'
import { View, Animated } from 'react-native'
import { Easing } from 'react-native-reanimated'
import { Swipeable, Gesture, GestureDetector } from 'react-native-gesture-handler'
import { CredentialSummary, getCredentialStatus } from '@sphereon/ui-components.credential-branding'
import { SSICredentialCardView } from '@sphereon/ui-components.ssi-react-native'

type Props = {
  credentials?: Array<CredentialSummary>
  // TODO no onPress, disable all singleTap functionality
  onPress?: () => Promise<void>
  // TODO no onSwipe, disable all swipe functionality
  onSwipe?: () => Promise<void>
}

const CARD_HEIGHT = 186;
const CARD_EXPANDED_HEIGHT = 316;
const CARD_SPACING = 55;
const CARD_ANIMATION_DURATION = 250;
const CARD_SWIPE_ACTION_WIDTH = 100;
const GESTURE_TAP_MAX_DURATION = 250;

export const CredentialCardStackView: FC<Props> = (props: Props): ReactElement => {
  const {credentials = [], onPress, onSwipe} = props;
  const [y, setY] = useState<Animated.Value>(new Animated.Value(0));
  const [cardExpandedIndex, setCardExpandedIndex] = useState<number | null>(null);
  const [cardAnimatedHeights, setCardAnimatedHeights] = useState(credentials.map(() => new Animated.Value(CARD_HEIGHT)));
  const contentHeight = useRef(new Animated.Value((credentials.length-1) * CARD_SPACING + CARD_HEIGHT)).current;
  const swipeableRefs: Array<Swipeable | null> = [];
  let prevOpenedSwipeable: Swipeable | null;

  const onRightSwipe = (index: number): void => {
    if (prevOpenedSwipeable && prevOpenedSwipeable !== swipeableRefs[index]) {
      prevOpenedSwipeable.close();
    }
    prevOpenedSwipeable = swipeableRefs[index];
  };

  const onSingleTap = (index: number): void => {
    console.log(`Single tap! index: ${index}`)
  };

  const onDoubleTap = (index: number): void => {
    const expandedHeight = (credentials.length-2) * CARD_SPACING + (CARD_HEIGHT*2);
    const collapsedHeight = (credentials.length-1) * CARD_SPACING + CARD_HEIGHT

    if (cardExpandedIndex !== null && cardExpandedIndex !== index) {
      Animated.timing(cardAnimatedHeights[cardExpandedIndex], {
        toValue: CARD_HEIGHT,
        duration: CARD_ANIMATION_DURATION,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }

    const targetHeight = cardExpandedIndex === index ? CARD_HEIGHT : CARD_EXPANDED_HEIGHT;

    Animated.timing(contentHeight, {
      toValue: cardExpandedIndex === index ? collapsedHeight : expandedHeight,
      duration: CARD_ANIMATION_DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    Animated.timing(cardAnimatedHeights[index], {
      toValue: targetHeight,
      duration: CARD_ANIMATION_DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start((): void => {
      setCardExpandedIndex(prevIndex => (prevIndex === index ? null : index));
    });
  };

  return (
      <Animated.ScrollView
        scrollEventThrottle={16}
        contentContainerStyle={{
          height: contentHeight,
          flexGrow: 1
        }}
      >
        {credentials.map((credential, index) => {
          const inputRange = [-CARD_HEIGHT, 0]
          const outputRange = [CARD_HEIGHT * index, (CARD_HEIGHT - CARD_SPACING) * -index]
          if (index > 0) {
            inputRange.push(index);
            outputRange.push(CARD_HEIGHT * -index)
          }
          const translateY = y.interpolate({
            inputRange,
            outputRange,
            extrapolateRight: 'clamp'
          })
          const singleTap = Gesture.Tap()
            .maxDuration(GESTURE_TAP_MAX_DURATION)
            .runOnJS(true)
            .onStart(() => onSingleTap(index));
          const doubleTap = Gesture.Tap()
            .maxDuration(GESTURE_TAP_MAX_DURATION)
            .numberOfTaps(2)
            .runOnJS(true)
            .onStart(() => onDoubleTap(index));

          return (
            <GestureDetector
              key={index}
              // disable the doubleTap for the last card, as this one is always completely visible, and also causes some layout issues iof enabled
              gesture={(index !== credentials.length-1) ? Gesture.Exclusive(doubleTap, singleTap) : Gesture.Exclusive(singleTap)}
            >
              <Animated.View style={{ transform: [{ translateY }], height: cardAnimatedHeights[index], alignItems: 'center'}} >
                <Swipeable
                  ref={ref => swipeableRefs[index] = ref}
                  renderRightActions={() => <View style={{width: CARD_SWIPE_ACTION_WIDTH}}/>}
                  onSwipeableRightOpen={() => onRightSwipe(index)}
                  containerStyle={{width: '100%', flex: 1, alignItems: 'center'}}
                >
                  <SSICredentialCardView
                    header={{
                      credentialTitle: credential.branding?.alias,
                      credentialSubtitle: credential.branding?.description,
                      logo: credential.branding?.logo,
                    }}
                    body={{
                      issuerName: credential.issuer.name,
                    }}
                    footer={{
                      credentialStatus: getCredentialStatus(credential),
                      expirationDate: credential.expirationDate,
                    }}
                    display={{
                      backgroundColor: credential.branding?.background?.color,
                      backgroundImage: credential.branding?.background?.image,
                      textColor: credential.branding?.text?.color,
                    }}
                  />
                </Swipeable>
              </Animated.View>
            </GestureDetector>
          );
        })}
      </Animated.ScrollView>
  )
}

export default CredentialCardStackView;
