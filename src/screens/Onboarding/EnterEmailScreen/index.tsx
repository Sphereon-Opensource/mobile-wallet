import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useCallback, useContext, useState} from 'react';
import InfoBubble from '../../../components/containers/InfoBubble';
import {EMAIL_ADDRESS_MAX_LENGTH} from '../../../@config/constants';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import SSITextInputControlledField from '../../../components/fields/SSITextInputControlledField';
import {useAccessibility} from '../../../hooks/useAccessibility';
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
  const {isScreenReaderEnabled, announce} = useAccessibility();
  const translationsPath = 'onboarding_pages.enter_email_address';
  const {isValid, error} = validate(emailAddress, [
    isNonEmptyString(translate(`${translationsPath}.text_field.errors.missing`)),
    IsValidEmail(translate(`${translationsPath}.text_field.errors.invalid`)),
  ]);
  const submit = useCallback(() => {
    setShowError(true);
    announce({message: 'Email address entered successfully'});
    onboardingInstance.send(OnboardingMachineEvents.NEXT), [onboardingInstance];
  }, [onboardingInstance]);
  const footer = (
    <PrimaryButton
      caption={translate('action_continue_label')}
      accessibilityState={{disabled: !isValid}}
      accessibilityLabel={!isValid ? 'Fill in a valid email address before continuing' : 'Continue with the creation of your wallet'}
      disabled={!isValid}
      captionColor={fontColors.light}
      onPress={submit}
    />
  );
  return (
    <ScreenContainer footer={footer} importantForAccessibility="no">
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} accessibilityFocusOnTitle />
      <TextInputContainer style={{marginBottom: 'auto'}} importantForAccessibility="no">
        <InfoBubble message={translate('onboarding_data_stored_locally_info')} />
        <SSITextInputControlledField
          autoComplete="email"
          textContentType="emailAddress"
          accessibilityLabel={translate(`${translationsPath}.text_field.accessibility.label`)}
          accessibilityValue={{text: emailAddress}}
          keyboardType="email-address"
          autoFocus={true}
          onSubmitEditing={isScreenReaderEnabled ? submit : undefined}
          value={emailAddress}
          label={translate(`${translationsPath}.text_field.label`)}
          error={isDirty || showError ? error?.message : undefined}
          maxLength={EMAIL_ADDRESS_MAX_LENGTH}
          onChangeText={v => {
            setIsDirty(true);
            onboardingInstance.send(OnboardingMachineEvents.SET_EMAIL_ADDRESS, {data: v});
          }}
          placeholder={isScreenReaderEnabled ? '' : translate(`${translationsPath}.text_field.placeholder`)}
        />
      </TextInputContainer>
    </ScreenContainer>
  );
};

export default EnterEmailScreen;
