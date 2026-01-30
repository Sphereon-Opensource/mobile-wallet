import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import React from 'react';
import {FlatList, View, useWindowDimensions} from 'react-native';
import Modal from 'react-native-modal';
import {useHeaderHeight} from '@react-navigation/elements';
import {PROGRESS_BAR_LAYOUT_HEIGHT} from '../../components/bars/onboarding';
import KeyboardAvoidingView from '../../components/containers/KeyboardAvoidingView';
import Localization, {translate} from '../../localization/Localization';
import {CloseIcon, ModalContentContainer, SSITextH1LightStyled, SSITextH3RegularLightStyled} from '../../styles/components';
import {Circle, Container, SelectedCircle} from '../../styles/components/modals/CountrySelectionModal';

export type LanguageOption = {
  label: string;
  value: string | null;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {label: translate('settings_language_system_default'), value: null},
  {label: 'English', value: Localization.supportedLanguages.ENGLISH},
  {label: 'Català', value: Localization.supportedLanguages.CATALAN},
  {label: 'Deutsch', value: Localization.supportedLanguages.GERMAN},
  {label: 'Español', value: Localization.supportedLanguages.SPANISH},
  {label: 'Français', value: Localization.supportedLanguages.FRENCH},
  {label: 'Nederlands', value: Localization.supportedLanguages.DUTCH},
  {label: 'Suomi', value: Localization.supportedLanguages.FINISH},
  {label: 'Svenska', value: Localization.supportedLanguages.SWEDISH},
  {label: 'Türkçe', value: Localization.supportedLanguages.TURKISH},
  {label: '中文', value: Localization.supportedLanguages.CHINESE},
  {label: '日本語', value: Localization.supportedLanguages.JAPANESE},
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (language: string | null) => void;
  selected: string | null;
  options: LanguageOption[];
  title?: string;
  /** When true, reduces top margin (used in onboarding where progress bar is present) */
  onboarding?: boolean;
};

const LanguageSelectionModal = ({open, selected, onClose, onSelect, options, title, onboarding}: Props) => {
  const {height: screenHeight} = useWindowDimensions();
  const [selectedLanguage, setSelectedLanguage] = React.useState<string | null>(selected);
  const headerHeight = useHeaderHeight();

  React.useEffect(() => {
    if (open) {
      setSelectedLanguage(selected);
    }
  }, [open, selected]);

  return (
    <Modal
      isVisible={open}
      style={{margin: 0}}
      deviceHeight={screenHeight}
      backdropColor="#292929"
      backdropOpacity={0.5}
      statusBarTranslucent
      onDismiss={onClose}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}>
      <KeyboardAvoidingView activeOn={['ios', 'android']} style={{flex: 1, pointerEvents: 'box-none'}}>
        <ModalContentContainer style={{marginTop: onboarding ? headerHeight - PROGRESS_BAR_LAYOUT_HEIGHT : headerHeight}}>
          <CloseIcon accessibilityLabel="Closes the language selection modal" onPress={onClose} />
          <View style={{gap: 24, flex: 1}}>
            <SSITextH1LightStyled accessibilityRole="header">
              {title ?? translate('settings_language_section_label')}
            </SSITextH1LightStyled>
            <FlatList
              keyExtractor={item => item.value ?? 'system'}
              data={options}
              renderItem={({item}) => {
                const isSelected = item.value === selectedLanguage;
                return (
                  <Container accessible accessibilityRole="radio" accessibilityState={{selected: isSelected}} onPress={() => setSelectedLanguage(item.value)}>
                    <SSITextH3RegularLightStyled>{item.label}</SSITextH3RegularLightStyled>
                    <Circle>{isSelected && <SelectedCircle />}</Circle>
                  </Container>
                );
              }}
              style={{flex: 1}}
              accessibilityRole="radiogroup"
              showsVerticalScrollIndicator={false}
            />
          </View>
          <PrimaryButton
            style={{marginTop: 24, width: '100%'}}
            caption={translate('action_select_label')}
            onPress={() => {
              onSelect(selectedLanguage);
              onClose();
            }}
          />
        </ModalContentContainer>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default LanguageSelectionModal;
