import {ImageAttributes} from '@sphereon/ui-components.core';
import {CredentialSummary, getCredentialStatus, getIssuerLogo} from '@sphereon/ui-components.credential-branding';
import {SSICredentialCardView, SSITextH4LightStyled} from '@sphereon/ui-components.ssi-react-native';
import React from 'react';
import {TouchableOpacity, TouchableWithoutFeedback} from 'react-native';
import Animated, {Extrapolation, FadeInUp, FadeOutUp, SharedValue, interpolate, useDerivedValue, withTiming} from 'react-native-reanimated';

type Props = {
  credential: CredentialSummary;
  yScroll: SharedValue<number>;
  listHeight: number;
  index: number;
  selected?: number;
  cardsUnderSelected: number;
  onSelect: () => void;
  onViewDetailsPress: () => void;
};

export const CARD_HEIGHT = 186;
export const CARD_OVERLAY = 126;
const CARD_EXPOSURE = CARD_HEIGHT - CARD_OVERLAY;
const UNDER_SELECTED_CARD_HEIGHT = 48;
const SELECTED_DRIFT = CARD_EXPOSURE - UNDER_SELECTED_CARD_HEIGHT;

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

export const Card = ({credential, cardsUnderSelected, index, selected, yScroll, onSelect, onViewDetailsPress, listHeight}: Props) => {
  const derivedYScroll = useDerivedValue(() => yScroll.value);
  const selectedPos = useDerivedValue(() => (selected ? selected * CARD_EXPOSURE - derivedYScroll.value : 0));
  const position = useDerivedValue(() => index * CARD_EXPOSURE - derivedYScroll.value);
  const defaultTranslateY = useDerivedValue(() => {
    const scrollFollowingTranslate = interpolate(derivedYScroll.value, [0, index * CARD_EXPOSURE], [0, -index * CARD_EXPOSURE], Extrapolation.CLAMP);
    return derivedYScroll.value + scrollFollowingTranslate - index * CARD_OVERLAY;
  });
  const selectedYAdjustment = useDerivedValue(() => {
    if (selected === undefined) {
      return withTiming(0, {duration: 300});
    }
    const indexAfterSelected = index - selected;
    const needsAdjustment = position.value > 0;
    const isAfterSelected = index > selected;
    const selectedTopOffset = Math.max(selectedPos.value, 0);
    const value = !needsAdjustment
      ? 0
      : isAfterSelected
      ? listHeight - (cardsUnderSelected + 1) * UNDER_SELECTED_CARD_HEIGHT - SELECTED_DRIFT * indexAfterSelected - selectedTopOffset
      : -position.value;
    return withTiming(value, {duration: 300});
  });
  const translateY = useDerivedValue(() => defaultTranslateY.value + selectedYAdjustment.value);
  return (
    <TouchableWithoutFeedback onPress={onSelect}>
      <Animated.View
        style={{
          alignItems: 'center',
          transform: [{translateY}],
          height: CARD_HEIGHT,
        }}>
        <CredentialViewCard key={credential.id} credential={credential} />
        {index === selected && (
          <Animated.View entering={FadeInUp} exiting={FadeOutUp} style={{marginTop: 16}}>
            <TouchableOpacity onPress={onViewDetailsPress}>
              <SSITextH4LightStyled>Go to Details</SSITextH4LightStyled>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
