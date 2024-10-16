import {ImageAttributes} from '@sphereon/ui-components.core';
import {CredentialSummary, getCredentialStatus, getIssuerLogo} from '@sphereon/ui-components.credential-branding';
import {SSICredentialCardView} from '@sphereon/ui-components.ssi-react-native';
import React, {useMemo} from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {Extrapolation, SharedValue, interpolate, useDerivedValue, withTiming} from 'react-native-reanimated';

export enum CardOverlap {
  SMALL = 5,
  BIG = 126,
  NONE = -10,
}

type Props = {
  credential: CredentialSummary;
  yScroll: SharedValue<number>;
  listHeight: number;
  index: number;
  tappedIndex?: number;
  onTap: () => void;
  onDoubleTap: () => void;
  cardOverlap: CardOverlap;
};

export const CARD_HEIGHT = 186;

const getCredentialCardLogo = (credential: CredentialSummary): ImageAttributes | undefined => {
  if (credential.branding?.logo?.uri || credential.branding?.logo?.dataUri) {
    return credential.branding.logo;
  }
  const uri: string | undefined = getIssuerLogo(credential, credential.branding);
  if (uri) {
    return {uri};
  }
};

const CredentialViewCard = ({credential}: {credential: CredentialSummary}) => {
  const issuer: string = credential.issuer.alias;
  const credentialCardLogo: ImageAttributes | undefined = getCredentialCardLogo(credential);

  return (
    <SSICredentialCardView
      header={{
        credentialTitle: credential.branding?.alias,
        credentialSubtitle: credential.branding?.description,
        logo: credentialCardLogo,
      }}
      body={{
        issuerName: issuer ?? credential.issuer.name,
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
  );
};

export const CARD_SCROLL_OVERLAP = CardOverlap.SMALL;

export const Card = ({credential, index, yScroll, tappedIndex, onTap, onDoubleTap, cardOverlap}: Props) => {
  const derivedYScroll = useDerivedValue(() => yScroll.value);
  const cardExposure = useMemo(() => CARD_HEIGHT - cardOverlap, [cardOverlap]);
  const tappedIndexPos = useDerivedValue(() => (tappedIndex ? tappedIndex * cardExposure - derivedYScroll.value : 0));
  const position = useDerivedValue(() => index * cardExposure - derivedYScroll.value);
  console.log({tappedIndex});
  const scrollFollowingTranslate = useDerivedValue(() => {
    const opposite = interpolate(
      derivedYScroll.value,
      [0, index * cardExposure],
      [0, -index * (cardExposure - CARD_SCROLL_OVERLAP)],
      Extrapolation.CLAMP,
    );
    return derivedYScroll.value + opposite;
  });
  const overlapOffset = useDerivedValue(() => withTiming(-index * cardOverlap, {duration: 300}));
  const tappedIndexYAdjustment = useDerivedValue(() => {
    if (tappedIndex === undefined) {
      return withTiming(0, {duration: 300});
    }
    const indexAftertappedIndex = index - tappedIndex;
    const needsAdjustment = position.value > 0;
    console.log({needsAdjustment, index});
    const isAftertappedIndex = index > tappedIndex;
    const tappedIndexTopOffset = Math.max(tappedIndexPos.value, 0);
    const value = !needsAdjustment ? 0 : isAftertappedIndex ? -100 : -position.value;
    return withTiming(value, {duration: 300});
  });

  const translateY = useDerivedValue(() => scrollFollowingTranslate.value + overlapOffset.value + tappedIndexYAdjustment.value);
  const doubleTap = useMemo(() => Gesture.Tap().numberOfTaps(2).onStart(onDoubleTap), [onDoubleTap]);
  const singleTap = useMemo(() => Gesture.Tap().onStart(onTap), [onTap]);
  return (
    <GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap)}>
      <Animated.View
        style={{
          alignItems: 'center',
          transform: [{translateY}],
          height: CARD_HEIGHT,
        }}>
        <CredentialViewCard key={credential.id} credential={credential} />
      </Animated.View>
    </GestureDetector>
  );
};
