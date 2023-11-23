import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {Keyboard, TouchableWithoutFeedback} from 'react-native';

import {EMAIL_ADDRESS_MAX_LENGTH, EMAIL_ADDRESS_VALIDATION_REGEX, FIRST_NAME_MAX_LENGTH, LAST_NAME_MAX_LENGTH} from '../../../@config/constants';
import SSIButtonsContainer from '../../../components/containers/SSIButtonsContainer';
import SSITextInputField from '../../../components/fields/SSITextInputField';
import {translate} from '../../../localization/Localization';
import {
  SSIFullHeightScrollViewContainer as SSIScrollView,
  SSIPersonalDataScreenContainerStyled as Container,
  SSIPersonalDataScreenTextInputContainerStyled as TextInputContainer,
  SSIPersonalDataScreenTextInputsContainerStyled as TextInputsContainer,
} from '../../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.PERSONAL_DATA>;

const SSIPersonalDataScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const {onNext, onBack, context, onPersonalData, isDisabled} = props.route.params;
  const personalData = {...context.personalData}; // shallow copy given we will manipulate the data

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

  const onFirstNameChange = async (value: string): Promise<void> => {
    personalData.firstName = value.trim();
    handlePersonalData();
  };

  const onFirstNameValidation = async (value: string): Promise<void> => {
    if (value.length === 0) {
      return Promise.reject(Error(translate('first_name_invalid_message')));
    }
  };

  const onLastNameChange = async (value: string): Promise<void> => {
    personalData.lastName = value.trim();
    handlePersonalData();
  };

  const onLastNameValidation = async (value: string): Promise<void> => {
    if (value.length === 0) {
      return Promise.reject(Error(translate('last_name_invalid_message')));
    }
  };

  const onEmailAddressChange = async (value: string): Promise<void> => {
    personalData.emailAddress = value.toLowerCase().trim();
    handlePersonalData(); // We are doing this on change, given the user otherwise need to tap outside of the input to trigger validation and enable the next button
  };

  const onEmailAddressValidation = async (value: string): Promise<void> => {
    handlePersonalData();
    if (!EMAIL_ADDRESS_VALIDATION_REGEX.test(value)) {
      return Promise.reject(Error(translate('email_address_invalid_message')));
    }
  };

  const handleNext = async (): Promise<void> => {
    Keyboard.dismiss();
    onNext(personalData);
  };

  const checkDisabled = (): boolean => {
    return isDisabled(personalData);
  };

  const handlePersonalData = () => {
    onPersonalData(personalData);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Container>
        <SSIScrollView>
          <TextInputsContainer>
            <TextInputContainer>
              <SSITextInputField
                autoComplete={'name-given'}
                autoFocus={true}
                initialValue={personalData.firstName}
                label={translate('first_name_label')}
                maxLength={FIRST_NAME_MAX_LENGTH}
                onChangeText={onFirstNameChange}
                onEndEditing={onFirstNameValidation}
                placeholderValue={translate('first_name_placeholder')}
              />
            </TextInputContainer>
            <TextInputContainer>
              <SSITextInputField
                autoComplete={'name-family'}
                initialValue={personalData.lastName}
                label={translate('last_name_label')}
                maxLength={LAST_NAME_MAX_LENGTH}
                onChangeText={onLastNameChange}
                onEndEditing={onLastNameValidation}
                placeholderValue={translate('last_name_placeholder')}
              />
            </TextInputContainer>
            <SSITextInputField
              label={translate('email_address_label')}
              initialValue={personalData.emailAddress}
              maxLength={EMAIL_ADDRESS_MAX_LENGTH}
              autoComplete={'email'}
              onChangeText={onEmailAddressChange}
              onEndEditing={onEmailAddressValidation}
              placeholderValue={translate('email_address_placeholder')}
            />
          </TextInputsContainer>
          <SSIButtonsContainer
            primaryButton={{
              caption: translate('action_next_label'),
              disabled: checkDisabled(),
              onPress: handleNext,
            }}
          />
        </SSIScrollView>
      </Container>
    </TouchableWithoutFeedback>
  );
};

export default SSIPersonalDataScreen;
