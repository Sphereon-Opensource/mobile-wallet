import React, {FC, ReactElement, useEffect, useRef, useState} from 'react';
import {Animated, ScrollViewProps, View} from 'react-native';
import {Easing} from 'react-native-reanimated';
import {Swipeable, Gesture, GestureDetector, TapGesture} from 'react-native-gesture-handler';
import {toLocalDateString} from '@sphereon/ui-components.core';
import {CredentialSummary, getCredentialStatus} from '@sphereon/ui-components.credential-branding';
import {SSICredentialCardView} from '@sphereon/ui-components.ssi-react-native';
import {getCardElementArgs} from '../../../types';

type Props = {
  credentials?: Array<CredentialSummary>;
  onPress?: (credential: CredentialSummary) => Promise<void>;
  onSwipe?: (credential: CredentialSummary) => Promise<void>;
} & ScrollViewProps;

const CARD_HEIGHT = 186;
const CARD_EXPANDED_HEIGHT = 316;
const CARD_SPACING = 55;
const CARD_ANIMATION_DURATION = 250;
const CARD_SWIPE_ACTION_WIDTH = 100;
const GESTURE_TAP_MAX_DURATION = 250;

export const CredentialCardStackView: FC<Props> = (props: Props): ReactElement => {
  const {credentials = [], onPress, onSwipe, ...rest} = props;
  const [y, setY] = useState<Animated.Value>(new Animated.Value(0));
  const [cardExpandedIndex, setCardExpandedIndex] = useState<number | null>(null);
  const [cardAnimatedHeights, setCardAnimatedHeights] = useState(credentials.map(() => new Animated.Value(CARD_HEIGHT)));
  const [swipedCardIndex, setSwipedCardIndex] = useState<number | undefined>();
  const contentHeight = useRef(new Animated.Value((credentials.length - 1) * CARD_SPACING + CARD_HEIGHT)).current;
  const swipeableRefs: Array<Swipeable | null> = [];

  useEffect((): void => {
    setCardAnimatedHeights(credentials.map(() => new Animated.Value(CARD_HEIGHT)));
  }, [credentials]);

  useEffect((): void => {
    swipeableRefs.forEach((ref, index): void => {
      if (index !== swipedCardIndex) {
        ref?.close();
      }
    });
  }, [swipedCardIndex]);

  const onRightSwipe = (credential: CredentialSummary, index: number): void => {
    setSwipedCardIndex(index);
    onSwipe?.(credential).then(() => setSwipedCardIndex(undefined));
  };

  const onSingleTap = (credential: CredentialSummary): void => {
    onPress?.(credential);
  };

  const onDoubleTap = (index: number): void => {
    // disable the doubleTap for the last card, as this one is always completely visible, and also causes some layout issues if enabled
    // we do this here so that all cards do have a double tap and the user does not get confused as to why the last card behaves differently with only a single tap
    if (index === credentials.length - 1) {
      return;
    }

    const expandedHeight = (credentials.length - 2) * CARD_SPACING + CARD_HEIGHT * 2;
    const collapsedHeight = (credentials.length - 1) * CARD_SPACING + CARD_HEIGHT;

    // Collapse the previous expended card
    if (cardExpandedIndex !== null && cardExpandedIndex !== index) {
      Animated.timing(cardAnimatedHeights[cardExpandedIndex], {
        toValue: CARD_HEIGHT,
        duration: CARD_ANIMATION_DURATION,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }

    const targetHeight = cardExpandedIndex === index ? CARD_HEIGHT : CARD_EXPANDED_HEIGHT;

    // Set the right content height for the scrollview if a card is getting expanded
    Animated.timing(contentHeight, {
      toValue: cardExpandedIndex === index ? collapsedHeight : expandedHeight,
      duration: CARD_ANIMATION_DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Expand the new card
    Animated.timing(cardAnimatedHeights[index], {
      toValue: targetHeight,
      duration: CARD_ANIMATION_DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start((): void => {
      setCardExpandedIndex(prevIndex => (prevIndex === index ? null : index));
    });
  };

  const getCardElementFrom = (args: getCardElementArgs): ReactElement => {
    const {credential, index} = args;

    const inputRange = [-CARD_HEIGHT, 0];
    const outputRange = [CARD_HEIGHT * index, (CARD_HEIGHT - CARD_SPACING) * -index];

    if (index > 0) {
      inputRange.push(index);
      outputRange.push(CARD_HEIGHT * -index);
    }

    const translateY = y.interpolate({
      inputRange,
      outputRange,
      extrapolateRight: 'clamp',
    });

    const singleTap = Gesture.Tap()
      .maxDuration(GESTURE_TAP_MAX_DURATION)
      .runOnJS(true)
      .onStart(() => onSingleTap(credential));
    const doubleTap = Gesture.Tap()
      .maxDuration(GESTURE_TAP_MAX_DURATION)
      .numberOfTaps(2)
      .runOnJS(true)
      .onStart(() => onDoubleTap(index));

    const gestures: Array<TapGesture> = [doubleTap, ...(onPress ? [singleTap] : [])];

    // TODO we should start supporting this on SSICredentialCardView
    const accessibility = {
      accessibilityLabel: `${credential.branding?.alias ?? credential.title}. Issued by: ${
        credential.issuer.alias ?? credential.issuer.name
      }, on: ${toLocalDateString(credential.issueDate)}. Expires on: ${toLocalDateString(credential.expirationDate)}. Status: ${
        credential.credentialStatus
      }`,
      accessibilityHint: 'Go to credential details',
    };

    return (
      <GestureDetector key={index} gesture={Gesture.Exclusive(...gestures)}>
        <Animated.View style={{transform: [{translateY}], height: cardAnimatedHeights[index], alignItems: 'center'}} {...accessibility}>
          <Swipeable
            ref={ref => (swipeableRefs[index] = ref)}
            {...(onSwipe && {
              renderRightActions: () => <View style={{width: CARD_SWIPE_ACTION_WIDTH}} />,
              onSwipeableRightWillOpen: () => onRightSwipe(credential, index),
            })}
            containerStyle={{width: '100%', flex: 1, alignItems: 'center'}}>
            <SSICredentialCardView
              header={{
                credentialTitle: credential.branding?.alias ?? credential.title,
                credentialSubtitle: credential.branding?.description,
                logo: credential.branding?.logo,
              }}
              body={{
                issuerName: credential.issuer.alias ?? credential.issuer.name,
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
  };

  return (
    <Animated.ScrollView
      {...rest}
      scrollEventThrottle={16}
      contentContainerStyle={{
        height: contentHeight,
        flexGrow: 1,
      }}>
      {credentials.map((credential, index) => getCardElementFrom({credential, index}))}
    </Animated.ScrollView>
  );
};

export default CredentialCardStackView;
