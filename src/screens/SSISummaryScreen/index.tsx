import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';

import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer';
import SSICredentialDetailsView from '../../components/views/SSICredentialDetailsView';
import SSITabView from '../../components/views/SSITabView';
import {translate} from '../../localization/Localization';
import {OnboardingEvents, onboardingService} from '../../services/onboardingMachine';
import {finalizeOnboarding} from '../../store/actions/onboarding.actions';
import {backgrounds} from '../../styles/colors';
import {SSIBasicHorizontalCenterContainerStyled as Container} from '../../styles/components';
import {ICredentialDetailsRow, ITabViewRoute, RootState, ScreenRoutesEnum, StackParamList} from '../../types';
import {IOnboardingState} from '../../types/store/onboarding.types';

import {v4 as uuidv4} from 'uuid';

interface IProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ONBOARDING_SUMMARY> {
  // onboardingState: IOnboardingState;
  // finalizeOnboarding: () => void;
}

enum SummaryTabRoutesEnum {
  INFO = 'info',
}

class SSIOnboardingSummaryScreen extends PureComponent<IProps> {
  getProperties = (): Array<ICredentialDetailsRow> => {
    const {personalData} = onboardingService.getSnapshot().context ?? {};

    return [
      {
        id: uuidv4(),
        label: translate('first_name_label'),
        value: personalData.firstName,
      },
      {
        id: uuidv4(),
        label: translate('last_name_label'),
        value: personalData.lastName,
      },
      {
        id: uuidv4(),
        label: translate('email_address_label'),
        value: personalData.emailAddress,
      },
    ];
  };

  onAccept = async (): Promise<void> => {
    // const {finalizeOnboarding, navigation} = this.props;
    onboardingService.send(OnboardingEvents.NEXT);

    // navigation.navigate(ScreenRoutesEnum.LOADING, {message: translate('action_onboarding_setup_message')});
    finalizeOnboarding();
  };

  render() {
    // const {onboardingState} = this.props;

    const routes: Array<ITabViewRoute> = [
      {
        key: SummaryTabRoutesEnum.INFO,
        title: translate('onboard_summary_info_tab_header_label'),
        // TODO replace refactored SSICredentialDetailsView to general component
        content: () => <SSICredentialDetailsView credentialProperties={this.getProperties()} />,
      },
    ];

    return (
      <Container>
        <SSITabView routes={routes} />
        <SSIButtonsContainer
          backgroundColor={backgrounds.secondaryDark}
          primaryButton={{
            caption: translate('onboard_summary_button_caption'),
            onPress: this.onAccept,
            // todo: USe same machine guard as the to be created one from the entry screen
            // disabled: onboardingState.loading,
          }}
        />
      </Container>
    );
  }
}

export default SSIOnboardingSummaryScreen;

/*
const mapStateToProps = (state: RootState) => {
  return {
    onboardingState: state.onboarding,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    finalizeOnboarding: () => dispatch(finalizeOnboarding()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SSIOnboardingSummaryScreen);
*/
