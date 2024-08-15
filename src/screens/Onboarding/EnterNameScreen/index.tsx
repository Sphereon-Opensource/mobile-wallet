import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useState} from 'react';
import {View} from 'react-native';
import {NAME_MAX_LENGTH} from '../../../@config/constants';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import SSITextInputControlledField from '../../../components/fields/SSITextInputControlledField';
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
  const translationsPath = 'onboarding_pages.enter_name';
  const {isValid, error} = validate(name, [isNonEmptyString(translate(`${translationsPath}.text_field.errors.missing`))]);
  return (
    <ScreenContainer>
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} />
      <View style={{marginBottom: 'auto'}}>
        <SSITextInputControlledField
          autoComplete="name-given"
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
          placeholder={translate(`${translationsPath}.text_field.placeholder`)}
        />
      </View>
      <PrimaryButton
        style={{height: 42, width: '100%'}}
        caption={translate('action_continue_label')}
        disabled={!isValid}
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
    </ScreenContainer>
  );
};

export default EnterNameScreen;
