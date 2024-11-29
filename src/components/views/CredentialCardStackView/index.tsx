import React, { createRef, FC, ReactElement, useRef, useState } from 'react'
import { View, StyleSheet, Dimensions, Animated, InteractionManager } from 'react-native'
import {
  CredentialSummary,
  getCredentialStatus
} from '@sphereon/ui-components.credential-branding'
import {
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
  State,
  Swipeable,
  Gesture, GestureDetector
} from 'react-native-gesture-handler'
import {
  HandlerStateChangeEvent
} from 'react-native-gesture-handler/lib/typescript/handlers/gestureHandlerCommon'
import {
  GestureStateChangeEvent
} from 'react-native-gesture-handler/src/handlers/gestureHandlerCommon'
import { Easing, runOnUI } from 'react-native-reanimated'
import { SSICredentialCardView } from '@sphereon/ui-components.ssi-react-native'

type Props = {
  credentials?: Array<CredentialSummary>
}

const cardHeight = 186;
const expandedCardHeight = 316;
const cardTitle = 55; // distance between cards
const cardPadding = 10;

const { height } = Dimensions.get("window");

const cards = [
  { name: "Shot",  color: "#a9d0b6", price: "30 CHF" },
  { name: "Juice", color: "#e9bbd1", price: "64 CHF" },
  { name: "Mighty Juice", color: "#eba65c", price: "80 CHF" },
  { name: "Sandwich", color: "#95c3e4", price: "85 CHF" },
  { name: "Combi", color: "#1c1c1c", price: "145 CHF" },
  { name: "Signature", color: "#a390bc", price: "92 CHF" },
  { name: "Coffee", color: "#fef2a0", price: "47 CHF" },
  { name: "Shot1", color: "#a9d0b6", price: "30 CHF" },
  { name: "Juice1", color: "#e9bbd1", price: "64 CHF" },
  { name: "Mighty Juice1", color: "#eba65c", price: "80 CHF" },
  { name: "Sandwich1", color: "#95c3e4", price: "85 CHF" },
  { name: "Combi1", color: "#1c1c1c", price: "145 CHF" },
  { name: "Signature1", color: "#a390bc", price: "92 CHF" },
  { name: "Coffee1", color: "#fef2a0", price: "47 CHF" },
  { name: "Shot2", color: "#a9d0b6", price: "30 CHF" },
  { name: "Juice2", color: "#e9bbd1", price: "64 CHF" },
  { name: "Mighty Juice2", color: "#eba65c", price: "80 CHF" },
  { name: "Sandwich2", color: "#95c3e4", price: "85 CHF" },
  { name: "Combi2", color: "#1c1c1c", price: "145 CHF" },
  { name: "Signature2", color: "#a390bc", price: "92 CHF" },
  { name: "Coffee2", color: "#fef2a0", price: "47 CHF" },
  { name: "Shot3", color: "#a9d0b6", price: "30 CHF" },
  { name: "Juice3", color: "#e9bbd1", price: "64 CHF" },
  { name: "Mighty Juice3", color: "#eba65c", price: "80 CHF" },
  { name: "Sandwich3", color: "#95c3e4", price: "85 CHF" },
  { name: "Combi3", color: "#1c1c1c", price: "145 CHF" },
  { name: "Signature3", color: "#a390bc", price: "92 CHF" },
  { name: "Coffee3", color: "#fef2a0", price: "47 CHF" }
];


export const CredentialCardStackView: FC<Props> = (props: Props): ReactElement => {
  const { credentials = [] } = props

  const [y, setY] = useState<Animated.Value>(new Animated.Value(0));
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null); // TODO undefined

  let row: Array<any> = [];
  let prevOpenedRow: any;

  const [animatedHeights, setAnimatedHeights] = useState(
    cards.map(() => new Animated.Value(cardHeight)) // Initialize an Animated.Value for each card
  );

  //let singleTapRef = createRef<TapGestureHandler>();

  // const onSingleTap = async (event: TapGestureHandlerStateChangeEvent) => {
  //   if (event.nativeEvent.state === State.ACTIVE) {
  //     console.log('I\'m touched')
  //   }
  // };
  //
  // const onDoubleTap = (event: TapGestureHandlerStateChangeEvent, cardIndex: number) => { // TODO name for cardIndex
  //   if (event.nativeEvent.state === State.ACTIVE) {
  //     console.log('Double tap, good job!')
  //     setExpandedCardIndex(prevIndex => (prevIndex === cardIndex ? null : cardIndex));
  //   }
  // };

  const onSwipe = (direction: string, index: any) => { // TODO any
    console.log(`swiped ${direction}, good job!`)
    // row[index].close();
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };

  const closeRow = (index: number) => {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  }

  const onSingleTap = (index: number) => { //event: GestureStateChangeEvent<{index: number}>
    console.log(`Single tap! index: ${index}`)
  };

  // const onDoubleTap = (index: number) => { // TODO name for cardIndex
  //   console.log(`Double tap! index: ${index}`)
  //   // setExpandedCardIndex(prevIndex => (prevIndex === index ? null : index));
  //
  //   const targetHeight = expandedCardIndex === index ? cardHeight : expandedCardHeight;
  //
  //   // Animate only the targeted card
  //   Animated.timing(animatedHeights[index], {
  //     toValue: targetHeight,
  //     duration: 300,
  //     useNativeDriver: false, // Cannot animate height with native driver
  //   }).start(() => {
  //     setExpandedCardIndex(prevIndex => (prevIndex === index ? null : index));
  //   });
  // };

  const onDoubleTap = (index: number) => {
    console.log(`Double tap! index: ${index}`);

    // If there is a previously expanded card, collapse it
    if (expandedCardIndex !== null && expandedCardIndex !== index) {
      Animated.timing(animatedHeights[expandedCardIndex], {
        toValue: cardHeight, // Collapse previous card
        duration: 250,
        easing: Easing.out(Easing.quad), // Smooth easing
        useNativeDriver: false,
      }).start();
    }

    // Animate the new card's height
    const targetHeight = expandedCardIndex === index ? cardHeight : expandedCardHeight;

    Animated.timing(animatedHeights[index], {
      toValue: targetHeight, // Expand or collapse the tapped card
      duration: 250,
      easing: Easing.out(Easing.quad), // Smooth easing
      useNativeDriver: false,
    }).start(() => {
      // Update the expandedCardIndex after animations complete
      setExpandedCardIndex(prevIndex => (prevIndex === index ? null : index));
    });
  };

  return (
      <Animated.ScrollView

        //style={{backgroundColor: 'green'}}
        //disableScrollViewPanResponder={true}

        // scrollEventThrottle={16}
        //contentContainerStyle={{  padding: 48 }}
        //showsVerticalScrollIndicator={false}
        // onScroll={Animated.event(
        //   [
        //     {
        //       nativeEvent: {
        //         contentOffset: { y },
        //       },
        //     },
        //   ],
        //   { useNativeDriver: true }
        // )} //StyleSheet.absoluteFill
      >
        <View style={{...styles.container, flex: 1}}>
          <View style={StyleSheet.absoluteFill}>
            {credentials.map((credential, i) => {
              const inputRange = [-cardHeight, 0];
              const outputRange = [
                cardHeight * i,
                (cardHeight - cardTitle) * -i
              ];

              if (i > 0) {
                inputRange.push(cardPadding * i);
                outputRange.push((cardHeight - cardPadding) * -i);
              }
              const translateY = y.interpolate({
                inputRange,
                outputRange,
                extrapolateRight: "clamp"
              });

              const cardHeightAnimated = animatedHeights[i]; // Use the animated height for each card
              // Calculate the card's height based on whether it is expanded or not
              // const cardHeightAnimated = expandedCardIndex === i ? expandedCardHeight : cardHeight; // TODO this can be a conditional style on height

              const singleTap = Gesture.Tap()
                .maxDuration(250)
                .runOnJS(true)
                .onStart(() => onSingleTap(i));

              const doubleTap = Gesture.Tap()
                .maxDuration(250)
                .numberOfTaps(2)
                .runOnJS(true)
                .onStart(() => onDoubleTap(i));

              return (
                <GestureDetector key={i} gesture={Gesture.Exclusive(doubleTap, singleTap)}>
                    <Animated.View style={{ transform: [{ translateY }], height: cardHeightAnimated, alignItems: 'center'}} >
                      <Swipeable
                        ref={ref => row[i] = ref}
                        renderRightActions={() => <View style={{width: 100}}/>}
                        onSwipeableOpen={(direction) => onSwipe(direction, i)}
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
                      </Swipeable >
                    </Animated.View>
                </GestureDetector>
              );
            })}
          </View>
          <Animated.ScrollView
            scrollEventThrottle={16}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: { y }
                  }
                }
              ],
              { useNativeDriver: false } //true
            )}
          />
        </View>
      </Animated.ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // margin: 16
  },
  container: {
    flex: 1,
    width: '100%'
    // backgroundColor: 'yellow',
  },
  content: {
    // width: '100%',
    height: height * 2,
    flex: 1,
    //backgroundColor: 'blue'
  }
});

export default CredentialCardStackView;
