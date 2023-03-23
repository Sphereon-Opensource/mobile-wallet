import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC, useMemo, useState} from 'react';
import {BackHandler} from 'react-native';

import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer';
import SSICheckbox from '../../components/fields/SSICheckbox';
import SSITabView from '../../components/views/SSITabView';
import SSITermsOfServiceView from '../../components/views/SSITermsOfServiceView';
import {translate} from '../../localization/Localization';
import {
  SSITermsOfServiceScreenBottomContainerStyled as BottomContainer,
  SSITermsOfServiceScreenCheckboxContainerStyled as CheckboxContainer,
  SSITermsOfServiceScreenCheckboxesContainerStyled as CheckboxesContainer,
  SSIBasicContainerStyled as Container,
  SSIStatusBarDarkModeStyled as StatusBar,
  SSITermsOfServiceScreenTabViewContainerStyled as TabViewContainer,
} from '../../styles/components';
import {ITabViewRoute, MainRoutesEnum, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.TERMS_OF_SERVICE>;

enum TermsTabRoutesEnum {
  TERMS = 'terms',
  PRIVACY = 'privacy',
}

const SSITermsOfServiceScreen: FC<Props> = (props: Props): JSX.Element => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);

  const routes: Array<ITabViewRoute> = [
    {
      key: TermsTabRoutesEnum.TERMS,
      title: translate('terms_of_service_terms_tab_header_label'),
      content: () => <SSITermsOfServiceView content={translate('terms_and_conditions_agreement_message')} onScrollBottom={onScrollBottomTerms} />,
    },
    {
      key: TermsTabRoutesEnum.PRIVACY,
      title: translate('terms_of_service_privacy_tab_header_label'),
      content: () => <SSITermsOfServiceView content={translate('privacy_policy_agreement_message')} onScrollBottom={onScrollBottomPrivacy} />,
    },
  ];

  /**
   * As we update the state for the checkboxes, the other elements of this screen will also rerender. In this case the ScrollView will reset it`s position.
   * useMemo will make sure it will not rerender if the state of the parent gets updated
   */
  const memoTabView = useMemo(() => <SSITabView routes={routes} />, []);

  const onAccept = async (): Promise<void> => {
    props.navigation.navigate(ScreenRoutesEnum.PERSONAL_DATA, {});
  };

  const onDecline = async (): Promise<void> => {
    props.navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('terms_of_service_decline_title'),
      details: translate('terms_of_service_decline_message'),
      primaryButton: {
        caption: translate('terms_of_service_decline_action_caption'),
        onPress: async () => BackHandler.exitApp(),
      },
    });
  };

  const onScrollBottomTerms = async (): Promise<void> => {
    setHasReadTerms(true);
  };

  const onScrollBottomPrivacy = async (): Promise<void> => {
    setHasReadPrivacy(true);
  };

  const onAcceptTerms = async (isChecked: boolean): Promise<void> => {
    setHasAcceptedTerms(isChecked);
  };

  const onAcceptPrivacy = async (isChecked: boolean): Promise<void> => {
    setHasAcceptedPrivacy(isChecked);
  };

  return (
    <Container>
      <StatusBar />
      <TabViewContainer>{memoTabView}</TabViewContainer>
      <BottomContainer>
        <CheckboxesContainer>
          <CheckboxContainer>
            <SSICheckbox onValueChange={onAcceptTerms} label={translate('terms_of_service_consent_terms_message')} disabled={!hasReadTerms} />
          </CheckboxContainer>
          <CheckboxContainer>
            <SSICheckbox onValueChange={onAcceptPrivacy} label={translate('terms_of_service_consent_privacy_message')} disabled={!hasReadPrivacy} />
          </CheckboxContainer>
        </CheckboxesContainer>
        <SSIButtonsContainer
          secondaryButton={{
            caption: translate('action_decline_label'),
            onPress: onDecline,
          }}
          primaryButton={{
            caption: translate('action_accept_label'),
            disabled: !hasAcceptedTerms || !hasAcceptedPrivacy,
            onPress: onAccept,
          }}
        />
      </BottomContainer>
    </Container>
  );
};

export default SSITermsOfServiceScreen;
