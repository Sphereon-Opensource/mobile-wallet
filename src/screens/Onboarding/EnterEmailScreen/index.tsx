import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useState} from 'react';
import {EMAIL_ADDRESS_MAX_LENGTH} from '../../../@config/constants';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import SSITextInputControlledField from '../../../components/fields/SSITextInputControlledField';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {EnterNameScreenTextInputsContainerStyled as TextInputContainer} from '../../../styles/components';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {IsValidEmail, isNonEmptyString, validate} from '../../../utils/validate';

const EnterEmailScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const [isDirty, setIsDirty] = useState(false);
  const [showError, setShowError] = useState(false);
  const {
    context: {emailAddress},
  } = onboardingInstance.getSnapshot();
  const translationsPath = 'onboarding_pages.enter_email_address';
  const {isValid, errorMessage} = validate(emailAddress, [
    isNonEmptyString(translate(`${translationsPath}.text_field.errors.missing`)),
    IsValidEmail(translate(`${translationsPath}.text_field.errors.invalid`)),
  ]);
  return (
    <ScreenContainer>
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} />
      <TextInputContainer style={{marginBottom: 'auto'}}>
        <SSITextInputControlledField
          autoComplete="email"
          keyboardType="email-address"
          autoFocus={true}
          value={emailAddress}
          label={translate(`${translationsPath}.text_field.label`)}
          error={isDirty || showError ? errorMessage : undefined}
          maxLength={EMAIL_ADDRESS_MAX_LENGTH}
          onChangeText={v => {
            setIsDirty(true);
            onboardingInstance.send(OnboardingMachineEvents.SET_EMAIL_ADDRESS, {data: v});
          }}
          placeholder={translate(`${translationsPath}.text_field.placeholder`)}
        />
      </TextInputContainer>
      <PrimaryButton
        style={{height: 42, width: '100%'}}
        caption={translate('action_continue_label')}
        disabled={!isValid}
        captionColor={fontColors.light}
        onPress={() => {
          setShowError(true);
          onboardingInstance.send(OnboardingMachineEvents.NEXT);
        }}
      />
    </ScreenContainer>
  );
};

export default EnterEmailScreen;
