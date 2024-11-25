import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useCallback, useContext, useState} from 'react';
import {View} from 'react-native';
import {NAME_MAX_LENGTH} from '../../../@config/constants';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import SSITextInputControlledField from '../../../components/fields/SSITextInputControlledField';
import {useAccessibility} from '../../../hooks/useAccessibility';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {isNonEmptyString, validate} from '../../../utils/validate';

const EnterNameScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const [isDirty, setIsDirty] = useState(false);
  const {
    context: {name},
  } = onboardingInstance.getSnapshot();
  const {isScreenReaderEnabled, announce} = useAccessibility();
  const translationsPath = 'onboarding_pages.enter_name';
  const {isValid, error} = validate(name, [isNonEmptyString(translate(`${translationsPath}.text_field.errors.missing`))]);
  const submit = useCallback(() => {
    announce({message: 'Name entered successfully'});
    onboardingInstance.send(OnboardingMachineEvents.NEXT);
  }, [onboardingInstance]);
  const footer = (
    <PrimaryButton
      accessibilityRole="button"
      style={{height: 42, width: '100%'}}
      caption={translate('action_continue_label')}
      accessibilityState={{disabled: !isValid}}
      accessibilityLabel={!isValid ? 'Fill in a name before continuing' : 'Continue with the creation of your wallet'}
      disabled={!isValid}
      captionColor={fontColors.light}
      onPress={submit}
    />
  );
  return (
    <ScreenContainer footer={footer} importantForAccessibility="no">
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} accessibilityFocusOnTitle />
      <View style={{marginBottom: 'auto'}} importantForAccessibility="no">
        <SSITextInputControlledField
          accessibilityLabel={translate(`${translationsPath}.text_field.accessibility.label`)}
          accessibilityValue={{text: name}}
          autoComplete="name-given"
          textContentType="name"
          onSubmitEditing={isScreenReaderEnabled ? submit : undefined}
          keyboardType="default"
          autoFocus={true}
          value={name}
          label={translate(`${translationsPath}.text_field.label`)}
          error={isDirty && !isValid ? error?.message : undefined}
          maxLength={NAME_MAX_LENGTH}
          onChangeText={v => {
            setIsDirty(true);
            onboardingInstance.send(OnboardingMachineEvents.SET_NAME, {data: v});
          }}
          placeholder={isScreenReaderEnabled ? '' : translate(`${translationsPath}.text_field.placeholder`)}
        />
      </View>
    </ScreenContainer>
  );
};

export default EnterNameScreen;
