import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import SSIButtonsContainer from '../../../components/containers/SSIButtonsContainer';
import {translate} from '../../../localization/Localization';
import {
  SSIBasicContainerStyled as Container,
  SSITermsOfServiceScreenLinkText as LinkText,
  SSITermsOfServiceScreenHighlightedLinkText as HighlightedLink,
  SSITermsOfServiceScreenDescriptionContainerStyled as DescriptionContainer,
  SSITermsOfServiceScreenDescriptionTextStyed as Description,
  SSITermsOfServiceScreenLinkContainer as LinkContainer,
  SSITermsOfServiceLinkPressable as LinkPressable,
  SSITermsOfServiceScreenLinkAndTextContainer as LinkTextContainer,
  SSITextH1LightStyled as HeaderCaption,
} from '../../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.TERMS_OF_SERVICE>;

const SSITermsOfServiceScreen: FC<Props> = (props: Props): React.JSX.Element => {
  const {navigation} = props;
  const {onBack, onAcceptTerms, onAcceptPrivacy, onNext} = props.route.params;

  useBackHandler((): boolean => {
    if (onBack) {
      void onBack();
      // make sure event stops here
      return true;
    }

    // FIXME for some reason returning false does not execute default behaviour
    navigation.goBack();
    return true;
  });

  /** NOTE: may need to be passed as context to the following screen
   * instead, and run during an onBack procedure, since there is no
   * longer a need for declining T&C's on this screen directly.
   */
  // const handleDecline = async (): Promise<void> => {
  //   props.navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
  //     title: translate('terms_of_service_decline_title'),
  //     details: translate('terms_of_service_decline_message'),
  //     primaryButton: {
  //       caption: translate('terms_of_service_decline_action_caption'),
  //       onPress: async () => {
  //         // Will only push it to the background, we are not allowed by Apple (and Google?) to shutdown apps. A user needs to do this.
  //         BackHandler.exitApp();
  //         await onDecline();
  //       },
  //     },
  //     secondaryButton: {
  //       caption: translate('action_cancel_label'),
  //       onPress: async () => {
  //         props.navigation.goBack();
  //       },
  //     },
  //   });
  // };

  const handleAcceptTerms = (value: boolean) => {
    return Promise.resolve(onAcceptTerms(value));
  };

  const handleAcceptPrivacy = (value: boolean) => {
    return Promise.resolve(onAcceptPrivacy(value));
  };

  const onAcceptAllAndContinue = async () => {
    await handleAcceptTerms(true);
    await handleAcceptPrivacy(true);
    onNext();
  };

  const onPressTermsOrPrivacy = () => {
    props.navigation.getParent()?.navigate(ScreenRoutesEnum.TERMS_OF_SERVICE_DETAIL);
  };

  return (
    <Container>
      <DescriptionContainer>
        <HeaderCaption style={{fontSize: 14}}>{translate('terms_of_service_description_heading')}</HeaderCaption>
        <Description>{translate('terms_of_service_description_text')}</Description>
      </DescriptionContainer>
      <LinkTextContainer>
        <LinkText>{translate('terms_of_service_link_section_text')}</LinkText>
        <LinkContainer>
          <LinkPressable onPress={onPressTermsOrPrivacy}>
            <HighlightedLink style={{margin: 0, padding: 0}} onPress={onPressTermsOrPrivacy}>{` ${translate(
              'terms_of_service_terms_link',
            )} `}</HighlightedLink>
          </LinkPressable>
          <LinkText>{translate('terms_of_service_link_section_and_text')}</LinkText>
          <LinkPressable onPress={onPressTermsOrPrivacy}>
            <HighlightedLink>{` ${translate('terms_of_service_privacy_link')}`}</HighlightedLink>
          </LinkPressable>
        </LinkContainer>
      </LinkTextContainer>
      <SSIButtonsContainer
        primaryButton={{
          caption: translate('action_accept_label'),
          disabled: false,
          onPress: onAcceptAllAndContinue,
        }}
      />
    </Container>
  );
};

export default SSITermsOfServiceScreen;
