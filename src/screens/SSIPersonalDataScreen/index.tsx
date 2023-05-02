import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {PureComponent} from 'react';
import {Keyboard, TouchableWithoutFeedback} from 'react-native';
import {connect} from 'react-redux';

import {EMAIL_ADDRESS_MAX_LENGTH, EMAIL_ADDRESS_VALIDATION_REGEX, FIRST_NAME_MAX_LENGTH, LAST_NAME_MAX_LENGTH} from '../../@config/constants';
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer';
import SSITextInputField from '../../components/fields/SSITextInputField';
import {translate} from '../../localization/Localization';
import {setPersonalData} from '../../store/actions/onboarding.actions';
import {
  SSIPersonalDataScreenContainerStyled as Container,
  SSIFullHeightScrollViewContainer as SSIScrollView,
  SSIPersonalDataScreenTextInputContainerStyled as TextInputContainer,
  SSIPersonalDataScreenTextInputsContainerStyled as TextInputsContainer,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {ISetPersonalDataActionArgs} from '../../types/store/onboarding.types';

interface IProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.PERSONAL_DATA> {
  setPersonalData: (args: ISetPersonalDataActionArgs) => void;
}

interface IState {
  firstName: string;
  lastName: string;
  emailAddress: string;
}

class SSIPersonalDataScreen extends PureComponent<IProps, IState> {
  state: IState = {
    firstName: '',
    lastName: '',
    emailAddress: '',
  };

  onFirstNameChange = async (value: string): Promise<void> => {
    this.setState({firstName: value});
  };

  onFirstNameValidation = async (value: string): Promise<void> => {
    if (value.length === 0) {
      return Promise.reject(Error(translate('first_name_invalid_message')));
    }
  };

  onLastNameChange = async (value: string): Promise<void> => {
    this.setState({lastName: value});
  };

  onLastNameValidation = async (value: string): Promise<void> => {
    if (value.length === 0) {
      return Promise.reject(Error(translate('last_name_invalid_message')));
    }
  };

  onEmailAddressChange = async (value: string): Promise<void> => {
    this.setState({emailAddress: value.toLowerCase()});
  };

  onEmailAddressValidation = async (value: string): Promise<void> => {
    if (!EMAIL_ADDRESS_VALIDATION_REGEX.test(value)) {
      this.setState({emailAddress: ''});
      return Promise.reject(Error(translate('email_address_invalid_message')));
    }
  };

  onNext = async (): Promise<void> => {
    const {firstName, lastName, emailAddress} = this.state;

    Keyboard.dismiss();

    // only validating email address here as the other fields do not have any special validation
    this.onEmailAddressValidation(emailAddress)
      .then(() => {
        this.props.setPersonalData({
          firstName,
          lastName,
          emailAddress,
        });

        this.props.navigation.navigate(ScreenRoutesEnum.PIN_CODE_SET, {
          headerSubTitle: translate('pin_code_choose_pin_code_subtitle'),
        });
      })
      .catch(() => {
        // do nothing as the state is already handled by the validate function, and we do not want to create the contact
      });
  };

  render() {
    const {firstName, lastName, emailAddress} = this.state;

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
                disabled: firstName.length === 0 || lastName.length === 0 || emailAddress.length === 0,
                onPress: this.onNext,
              }}
            />
          </SSIScrollView>
        </Container>
      </TouchableWithoutFeedback>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    setPersonalData: (args: ISetPersonalDataActionArgs) => dispatch(setPersonalData(args)),
  };
};

export default connect(null, mapDispatchToProps)(SSIPersonalDataScreen);
