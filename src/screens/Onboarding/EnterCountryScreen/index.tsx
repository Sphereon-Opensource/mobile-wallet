import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useMemo, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import SSIIconButton from '../../../components/buttons/SSIIconButton';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import SSITextInputControlledField from '../../../components/fields/SSITextInputControlledField';
import Localization, {translate} from '../../../localization/Localization';
import LanguageSelectionModal, {LANGUAGE_OPTIONS} from '../../../modals/LanguageSelectionModal';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {ButtonIconsEnum} from '../../../types';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';

const getLanguageLabel = (value: string | null): string => {
  return LANGUAGE_OPTIONS.find(opt => opt.value === value)?.label ?? translate('settings_language_system_default');
};

const EnterCountryScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const snapshot = onboardingInstance.getSnapshot();
  const translationsPath = 'onboarding_pages.select_language';

  const [language, setLanguage] = useState<string | null>(snapshot.context.language);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const currentLanguageLabel = useMemo(() => getLanguageLabel(language), [language]);

  const footer = (
    <View style={{marginTop: 'auto'}}>
      <PrimaryButton
        caption={translate('action_continue_label')}
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
    </View>
  );

  return (
    <ScreenContainer footer={footer} importantForAccessibility={isLanguageModalOpen ? 'no-hide-descendants' : 'no'}>
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} accessibilityFocusOnTitle />
      <TouchableOpacity
        onPress={() => setIsLanguageModalOpen(true)}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Select your language"
        accessibilityHint="Opens a modal to select your language">
        <SSITextInputControlledField
          importantForAccessibility="no"
          autoFocus={false}
          editable={false}
          value={currentLanguageLabel}
          label={translate('settings_language_section_label')}
          placeholder={translate('settings_language_system_default')}
          onPress={() => setIsLanguageModalOpen(true)}
          onPressIn={() => setIsLanguageModalOpen(true)}
          endAdornment={
            <SSIIconButton
              importantForAccessibility="no"
              icon={ButtonIconsEnum.CHEVRON}
              iconColor={backgroundColors.primaryLight}
              iconSize={16}
              style={{marginRight: 8}}
              onPress={() => setIsLanguageModalOpen(true)}
            />
          }
        />
      </TouchableOpacity>
      <LanguageSelectionModal
        open={isLanguageModalOpen}
        selected={language}
        options={LANGUAGE_OPTIONS}
        onboarding
        onClose={() => setIsLanguageModalOpen(false)}
        onSelect={selectedLanguage => {
          onboardingInstance.send(OnboardingMachineEvents.SET_LANGUAGE, {data: selectedLanguage});
          setLanguage(selectedLanguage);
          Localization.setI18nConfig(selectedLanguage);
        }}
      />
    </ScreenContainer>
  );
};

export default EnterCountryScreen;
