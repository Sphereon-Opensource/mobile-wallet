import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {PureComponent} from 'react';
import {BackHandler, Keyboard, NativeEventSubscription, TouchableWithoutFeedback} from 'react-native';

import {EMAIL_ADDRESS_MAX_LENGTH, EMAIL_ADDRESS_VALIDATION_REGEX, FIRST_NAME_MAX_LENGTH, LAST_NAME_MAX_LENGTH} from '../../@config/constants';
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer';
import SSITextInputField from '../../components/fields/SSITextInputField';
import {translate} from '../../localization/Localization';
import {IOnboardingPersonalData, OnboardingMachine} from '../../services/onboardingMachine';
import {
  SSIFullHeightScrollViewContainer as SSIScrollView,
  SSIPersonalDataScreenContainerStyled as Container,
  SSIPersonalDataScreenTextInputContainerStyled as TextInputContainer,
  SSIPersonalDataScreenTextInputsContainerStyled as TextInputsContainer,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

type IProps = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.PERSONAL_DATA>;

class SSIPersonalDataScreen extends PureComponent<IProps> {
  get personalData(): IOnboardingPersonalData {
    return this._personalData;
  }

  set personalData(value: IOnboardingPersonalData) {
    this._personalData = value;
  }

  hardwareBackPressListener: NativeEventSubscription;

  private _personalData: IOnboardingPersonalData = OnboardingMachine.instance.getSnapshot()?.context?.personalData ?? {
    firstName: '',
    lastName: '',
    emailAddress: '',
  };

  onFirstNameChange = async (value: string): Promise<void> => {
    this.personalData.firstName = value.trim();
  };

  onFirstNameValidation = async (value: string): Promise<void> => {
    if (value.length === 0) {
      return Promise.reject(Error(translate('first_name_invalid_message')));
    }
  };

  onLastNameChange = async (value: string): Promise<void> => {
    this.personalData.lastName = value.trim();
  };

  onLastNameValidation = async (value: string): Promise<void> => {
    if (value.length === 0) {
      return Promise.reject(Error(translate('last_name_invalid_message')));
    }
  };

  onEmailAddressChange = async (value: string): Promise<void> => {
    this.personalData.emailAddress = value.toLowerCase().trim();
  };

  onEmailAddressValidation = async (value: string): Promise<void> => {
    if (!EMAIL_ADDRESS_VALIDATION_REGEX.test(value)) {
      // this.setState({emailAddress: ''});
      return Promise.reject(Error(translate('email_address_invalid_message')));
    }
  };

  onNext = async (): Promise<void> => {
    const {emailAddress} = this._personalData;
    Keyboard.dismiss();

    // only validating email address here as the other fields do not have any special validation
    this.onEmailAddressValidation(emailAddress)
      .then(() => {
        this.props.route.params.onNext();
      })
      .catch(() => {
        // do nothing as the state is already handled by the validate function, and we do not want to create the contact
      });
  };

  isDisabled = (): boolean => {
    const {firstName, lastName, emailAddress} = this.personalData;
    return !firstName || firstName.length === 0 || !lastName || lastName.length === 0 || !emailAddress || emailAddress.length === 0;
  };

  componentDidMount() {
    this.hardwareBackPressListener = BackHandler.addEventListener('hardwareBackPress', () => {
      void this.props.route.params.onBack();
      // make sure event stops here
      return true;
    });
  }

  render() {
    console.log(`PERSONAL DATA: ${JSON.stringify(this.personalData)}`);

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Container>
          <SSIScrollView>
            <TextInputsContainer>
              <TextInputContainer>
                <SSITextInputField
                  autoComplete={'name-given'}
                  autoFocus={true}
                  label={translate('first_name_label')}
                  maxLength={FIRST_NAME_MAX_LENGTH}
                  onChangeText={this.onFirstNameChange}
                  onEndEditing={this.onFirstNameValidation}
                  placeholderValue={translate('first_name_placeholder')}
                />
              </TextInputContainer>
              <TextInputContainer>
                <SSITextInputField
                  autoComplete={'name-family'}
                  label={translate('last_name_label')}
                  maxLength={LAST_NAME_MAX_LENGTH}
                  onChangeText={this.onLastNameChange}
                  onEndEditing={this.onLastNameValidation}
                  placeholderValue={translate('last_name_placeholder')}
                />
              </TextInputContainer>
              <SSITextInputField
                label={translate('email_address_label')}
                maxLength={EMAIL_ADDRESS_MAX_LENGTH}
                autoComplete={'email'}
                onChangeText={this.onEmailAddressChange}
                onEndEditing={this.onEmailAddressValidation}
                placeholderValue={translate('email_address_placeholder')}
              />
            </TextInputsContainer>
            <SSIButtonsContainer
              primaryButton={{
                caption: translate('action_next_label'),
                // todo: move to guard in state machine
                disabled: !this.isDisabled,
                onPress: this.onNext,
              }}
            />
          </SSIScrollView>
        </Container>
      </TouchableWithoutFeedback>
    );
  }
}

export default SSIPersonalDataScreen;
