import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import React from 'react';
import {FlatList, Text, View, useWindowDimensions} from 'react-native';
import Modal from 'react-native-modal';
import {useHeaderHeight} from '@react-navigation/elements';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {PROGRESS_BAR_LAYOUT_HEIGHT} from '../../components/bars/onboarding';
import KeyboardAvoidingView from '../../components/containers/KeyboardAvoidingView';
import Localization, {translate} from '../../localization/Localization';
import {CloseIcon, ModalContentContainer, SSITextH1LightStyled, SSITextH3RegularLightStyled} from '../../styles/components';
import {Circle, Container, SelectedCircle} from '../../styles/components/modals/CountrySelectionModal';

export type LanguageOption = {
  label: string;
  value: string | null;
  flag?: string;
};

const LANGUAGE_FLAGS: Record<string, string> = {
  en: '\u{1F1EC}\u{1F1E7}',
  nl: '\u{1F1F3}\u{1F1F1}',
  de: '\u{1F1E9}\u{1F1EA}',
  fi: '\u{1F1EB}\u{1F1EE}',
  sv: '\u{1F1F8}\u{1F1EA}',
  ca: '\u{1F1EA}\u{1F1F8}',
  es: '\u{1F1EA}\u{1F1F8}',
  fr: '\u{1F1EB}\u{1F1F7}',
  ja: '\u{1F1EF}\u{1F1F5}',
  tr: '\u{1F1F9}\u{1F1F7}',
  zh: '\u{1F1E8}\u{1F1F3}',
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {label: translate('settings_language_system_default'), value: null},
  {label: 'English', value: Localization.supportedLanguages.ENGLISH, flag: LANGUAGE_FLAGS.en},
  {label: 'Català', value: Localization.supportedLanguages.CATALAN, flag: LANGUAGE_FLAGS.ca},
  {label: 'Deutsch', value: Localization.supportedLanguages.GERMAN, flag: LANGUAGE_FLAGS.de},
  {label: 'Español', value: Localization.supportedLanguages.SPANISH, flag: LANGUAGE_FLAGS.es},
  {label: 'Français', value: Localization.supportedLanguages.FRENCH, flag: LANGUAGE_FLAGS.fr},
  {label: 'Nederlands', value: Localization.supportedLanguages.DUTCH, flag: LANGUAGE_FLAGS.nl},
  {label: 'Suomi', value: Localization.supportedLanguages.FINISH, flag: LANGUAGE_FLAGS.fi},
  {label: 'Svenska', value: Localization.supportedLanguages.SWEDISH, flag: LANGUAGE_FLAGS.sv},
  {label: 'Türkçe', value: Localization.supportedLanguages.TURKISH, flag: LANGUAGE_FLAGS.tr},
  {label: '中文', value: Localization.supportedLanguages.CHINESE, flag: LANGUAGE_FLAGS.zh},
  {label: '日本語', value: Localization.supportedLanguages.JAPANESE, flag: LANGUAGE_FLAGS.ja},
];

export {LANGUAGE_FLAGS};

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

const LanguageSelectionModalContent = ({open, selected, onClose, onSelect, options, title, onboarding}: Props) => {
  const {height: screenHeight} = useWindowDimensions();
  const [selectedLanguage, setSelectedLanguage] = React.useState<string | null>(selected);
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (open) {
      setSelectedLanguage(selected);
    }
  }, [open, selected]);

  return (
    <KeyboardAvoidingView style={{flex: 1, pointerEvents: 'box-none'}}>
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
                  {item.flag && <Text style={{fontSize: 20, marginRight: 12}}>{item.flag}</Text>}
                  <SSITextH3RegularLightStyled>{item.label}</SSITextH3RegularLightStyled>
                  <Circle>{isSelected && <SelectedCircle />}</Circle>
                </Container>
              );
            }}
            style={{flex: 1}}
            accessibilityRole="radiogroup"
            showsVerticalScrollIndicator={true}
          />
        </View>
        <PrimaryButton
          style={{marginTop: 24, marginBottom: Math.max(0, insets.bottom - 36), width: '100%'}}
          caption={translate('action_select_label')}
          onPress={() => {
            onSelect(selectedLanguage);
            onClose();
          }}
        />
      </ModalContentContainer>
    </KeyboardAvoidingView>
  );
};

const LanguageSelectionModal = (props: Props) => {
  const {height: screenHeight} = useWindowDimensions();
  const {open, onClose} = props;

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
      <SafeAreaProvider>
        <LanguageSelectionModalContent {...props} />
      </SafeAreaProvider>
    </Modal>
  );
};

export default LanguageSelectionModal;
