import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {TCountryCode} from 'countries-list';
import {useContext, useMemo, useRef, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import SSIIconButton from '../../../components/buttons/SSIIconButton';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import SSITextInputControlledField from '../../../components/fields/SSITextInputControlledField';
import {useAccessibility} from '../../../hooks/useAccessibility';
import Localization, {translate} from '../../../localization/Localization';
import CountrySelectionModal from '../../../modals/CountrySelectionModal';
import LanguageSelectionModal, {LANGUAGE_OPTIONS} from '../../../modals/LanguageSelectionModal';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {ButtonIconsEnum} from '../../../types';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {countryOptions, getCountryPrimaryLanguage} from '../../../utils';
import {isNotNil, validate} from '../../../utils/validate';

const getLanguageLabel = (value: string | null): string => {
  return LANGUAGE_OPTIONS.find(opt => opt.value === value)?.label ?? translate('settings_language_system_default');
};

const EnterCountryScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const snapshot = onboardingInstance.getSnapshot();
  const translationsPath = 'onboarding_pages.enter_country';
  const {announce} = useAccessibility();

  // Local state mirrors machine context so the UI stays reactive
  const [countryCode, setCountryCode] = useState<TCountryCode | undefined>(snapshot.context.countryCode);
  const [language, setLanguage] = useState<string | null>(snapshot.context.language);
  const languageManuallySelectedRef = useRef(snapshot.context.languageManuallySelected);

  const [isCountryModalOpen, setIsCountryModalOpen] = useState(countryCode === undefined);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const {isValid} = validate(countryCode, [isNotNil(translate(`${translationsPath}.select.errors.missing`))]);

  const currentLanguageLabel = useMemo(() => getLanguageLabel(language), [language]);

  const footer = (
    <View style={{marginTop: 'auto'}}>
      <PrimaryButton
        style={{height: 42, width: '100%'}}
        caption={translate('action_continue_label')}
        disabled={!isValid}
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
    </View>
  );

  return (
    <ScreenContainer footer={footer} importantForAccessibility={isCountryModalOpen || isLanguageModalOpen ? 'no-hide-descendants' : 'no'}>
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} accessibilityFocusOnTitle />
      <TouchableOpacity
        onPress={() => setIsCountryModalOpen(true)}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Select your country"
        accessibilityHint="Opens a modal to select your country">
        <SSITextInputControlledField
          importantForAccessibility="no"
          autoFocus={false}
          editable={false}
          value={countryCode && countryOptions[countryCode].label}
          label={translate(`${translationsPath}.select.label`)}
          placeholder={translate(`${translationsPath}.select.placeholder`)}
          onPress={() => setIsCountryModalOpen(true)}
          onPressIn={() => setIsCountryModalOpen(true)}
          endAdornment={
            <SSIIconButton
              importantForAccessibility="no"
              icon={ButtonIconsEnum.CHEVRON}
              iconColor={backgroundColors.primaryLight}
              iconSize={16}
              style={{marginRight: 8}}
              onPress={() => setIsCountryModalOpen(true)}
            />
          }
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsLanguageModalOpen(true)}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Select your language"
        accessibilityHint="Opens a modal to select your language"
        style={{marginTop: 16}}>
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
      <CountrySelectionModal
        selected={countryCode}
        open={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        onSelect={selectedCountryCode => {
          onboardingInstance.send(OnboardingMachineEvents.SET_COUNTRY, {data: selectedCountryCode});
          setCountryCode(selectedCountryCode);
          // Auto-switch language from country when not manually selected
          if (!languageManuallySelectedRef.current) {
            const newLang = getCountryPrimaryLanguage(selectedCountryCode) ?? null;
            setLanguage(newLang);
            Localization.setI18nConfig(newLang);
          }
          announce({
            message: `${translate(`${translationsPath}.select.accessibility.select`)} ${countryOptions[selectedCountryCode].label}`,
            queue: true,
          });
          setIsCountryModalOpen(false);
        }}
      />
      <LanguageSelectionModal
        open={isLanguageModalOpen}
        selected={language}
        options={LANGUAGE_OPTIONS}
        onboarding
        onClose={() => setIsLanguageModalOpen(false)}
        onSelect={selectedLanguage => {
          onboardingInstance.send(OnboardingMachineEvents.SET_LANGUAGE, {data: selectedLanguage});
          setLanguage(selectedLanguage);
          languageManuallySelectedRef.current = true;
          Localization.setI18nConfig(selectedLanguage);
        }}
      />
    </ScreenContainer>
  );
};

export default EnterCountryScreen;
