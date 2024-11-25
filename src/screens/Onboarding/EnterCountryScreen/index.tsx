import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import SSIIconButton from '../../../components/buttons/SSIIconButton';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import SSITextInputControlledField from '../../../components/fields/SSITextInputControlledField';
import {useAccessibility} from '../../../hooks/useAccessibility';
import {translate} from '../../../localization/Localization';
import CountrySelectionModal from '../../../modals/CountrySelectionModal';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {ButtonIconsEnum} from '../../../types';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {countryOptions} from '../../../utils';
import {isNotNil, validate} from '../../../utils/validate';

const EnterCountryScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const {
    context: {countryCode},
  } = onboardingInstance.getSnapshot();
  const translationsPath = 'onboarding_pages.enter_country';
  const {announce, isScreenReaderEnabled} = useAccessibility();
  const [isModalOpen, setIsModalOpen] = useState(countryCode === undefined);
  const {isValid} = validate(countryCode, [isNotNil(translate(`${translationsPath}.select.errors.missing`))]);
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
    <ScreenContainer footer={footer} importantForAccessibility={isModalOpen ? 'no-hide-descendants' : 'no'}>
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} accessibilityFocusOnTitle />
      <TouchableOpacity
        onPress={() => setIsModalOpen(true)}
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
          onPress={() => setIsModalOpen(true)}
          onPressIn={() => setIsModalOpen(true)}
          endAdornment={
            <SSIIconButton
              importantForAccessibility="no"
              icon={ButtonIconsEnum.CHEVRON}
              iconColor={backgroundColors.primaryLight}
              iconSize={16}
              style={{marginRight: 8}}
              onPress={() => setIsModalOpen(true)}
            />
          }
        />
      </TouchableOpacity>
      <CountrySelectionModal
        selected={countryCode}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={selectedCountryCode => {
          onboardingInstance.send(OnboardingMachineEvents.SET_COUNTRY, {data: selectedCountryCode});
          announce({
            message: `${translate(`${translationsPath}.select.accessibility.select`)} ${countryOptions[selectedCountryCode].label}`,
            queue: true,
          });
          isScreenReaderEnabled && onboardingInstance.send(OnboardingMachineEvents.NEXT);
          setIsModalOpen(false);
        }}
        onModalHide={reason => reason === 'select' && onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
    </ScreenContainer>
  );
};

export default EnterCountryScreen;
