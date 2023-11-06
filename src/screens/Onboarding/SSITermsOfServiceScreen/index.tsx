import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC, useMemo} from 'react';
import {BackHandler} from 'react-native';

import SSIButtonsContainer from '../../../components/containers/SSIButtonsContainer';
import SSICheckbox from '../../../components/fields/SSICheckbox';
import SSITabView from '../../../components/views/SSITabView';
import SSITermsOfServiceView from '../../../components/views/SSITermsOfServiceView';
import {translate} from '../../../localization/Localization';
import {
  SSIBasicContainerStyled as Container,
  SSIStatusBarDarkModeStyled as StatusBar,
  SSITermsOfServiceScreenBottomContainerStyled as BottomContainer,
  SSITermsOfServiceScreenCheckboxContainerStyled as CheckboxContainer,
  SSITermsOfServiceScreenCheckboxesContainerStyled as CheckboxesContainer,
  SSITermsOfServiceScreenTabViewContainerStyled as TabViewContainer,
} from '../../../styles/components';
import {ITabViewRoute, MainRoutesEnum, ScreenRoutesEnum, StackParamList} from '../../../types';

type TermsOfServiceProps = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.TERMS_OF_SERVICE>;
enum TermsTabRoutesEnum {
  TERMS = 'terms',
  PRIVACY = 'privacy',
}

const SSITermsOfServiceScreen: FC<TermsOfServiceProps> = (props: TermsOfServiceProps): JSX.Element => {
  useBackHandler(() => {
    void props.route.params.onBack();
    // make sure event stops here
    return true;
  });

  const routes: Array<ITabViewRoute> = [
    {
      key: TermsTabRoutesEnum.TERMS,
      title: translate('terms_of_service_terms_tab_header_label'),
      content: () => <SSITermsOfServiceView content={translate('terms_and_conditions_agreement_message')} />,
    },
    {
      key: TermsTabRoutesEnum.PRIVACY,
      title: translate('terms_of_service_privacy_tab_header_label'),
      content: () => <SSITermsOfServiceView content={translate('privacy_policy_agreement_message')} />,
    },
  ];

  /**
   * As we update the state for the checkboxes, the other elements of this screen will also rerender. In this case the ScrollView will reset it`s position.
   * useMemo will make sure it will not rerender if the state of the parent gets updated
   */
  const memoTabView = useMemo(() => <SSITabView routes={routes} />, []);

  const onAccept = async (): Promise<void> => {
    // hardwareBackPressListener.remove()
    await props.route.params.onNext();
    // props.navigation.navigate(ScreenRoutesEnum.PERSONAL_DATA, {});
  };

  const onDecline = async (): Promise<void> => {
    props.navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('terms_of_service_decline_title'),
      details: translate('terms_of_service_decline_message'),
      primaryButton: {
        caption: translate('terms_of_service_decline_action_caption'),
        onPress: async () => {
          // Will only push it to the background, we are not allowed by Apple (and Google?) to shutdown apps. A user needs to do this.
          BackHandler.exitApp();
          props.route.params.onDecline();

          // onboardingService.send(OnboardingEvents.DECLINE);
          // Adding a reset back to the Welcome screen and to reset its state as it is active in the current stack
          /*  props.navigation.reset({
              index: 0,
              routes: [{name: ScreenRoutesEnum.WELCOME}],
            });*/
        },
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        onPress: async () => {
          props.navigation.goBack();
        },
      },
    });
  };

  const onAcceptTerms = async (isChecked: boolean): Promise<void> => {
    await props.route.params.onAcceptTerms(isChecked);
  };

  const onAcceptPrivacy = async (isChecked: boolean): Promise<void> => {
    await props.route.params.onAcceptPrivacy(isChecked);
  };

  return (
    <Container>
      <StatusBar />
      <TabViewContainer>{memoTabView}</TabViewContainer>
      <BottomContainer>
        <CheckboxesContainer>
          <CheckboxContainer>
            <SSICheckbox onValueChange={onAcceptTerms} label={translate('terms_of_service_consent_terms_message')} />
          </CheckboxContainer>
          <CheckboxContainer>
            <SSICheckbox onValueChange={onAcceptPrivacy} label={translate('terms_of_service_consent_privacy_message')} />
          </CheckboxContainer>
        </CheckboxesContainer>
        <SSIButtonsContainer
          secondaryButton={{
            caption: translate('action_decline_label'),
            onPress: onDecline,
          }}
          primaryButton={{
            caption: translate('action_accept_label'),
            disabled: props.route.params.isDisabled(),
            onPress: onAccept,
          }}
        />
      </BottomContainer>
    </Container>
  );
};

export default SSITermsOfServiceScreen;
