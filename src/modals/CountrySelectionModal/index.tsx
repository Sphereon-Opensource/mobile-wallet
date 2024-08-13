import {useHeaderHeight} from '@react-navigation/elements';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {useMemo} from 'react';
import {Keyboard, View, useWindowDimensions} from 'react-native';
import Modal from 'react-native-modal';
import {PROGRESS_BAR_LAYOUT_HEIGHT} from '../../components/bars/OnboardingHeader';
import KeyboardAvoidingView from '../../components/containers/KeyboardAvoidingView';
import CountrySelectOption from '../../components/fields/CountrySelectOption';
import OnboardingSearchField from '../../components/fields/OnboardingSearchField';
import {translate} from '../../localization/Localization';
import {SSITextH1LightStyled} from '../../styles/components';
import {CloseIcon, ModalContentContainer} from '../../styles/components/modals';
import {CountryOption} from '../../types';
import {Country} from '../../types/machines/onboarding';

type HideReason = 'close' | 'select';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedCountry: Country) => void;
  onModalHide?: (reason?: HideReason) => void;
  selected?: Country;
};

const countryOptions: Record<Country, Omit<CountryOption, 'selected'>> = {
  [Country.DEUTSCHLAND]: {
    name: Country.DEUTSCHLAND,
    flagURI: 'https://flagcdn.com/w40/de.png',
  },
};

const CountrySelectionModal = ({open, selected, onClose, onSelect, onModalHide}: Props) => {
  const {height: screenHeight} = useWindowDimensions();
  const [hideReason, setHideReason] = React.useState<HideReason>();
  const [selectedCountry, setSelectedCountry] = React.useState<Country | undefined>(selected);
  const [search, setSearch] = React.useState('');
  const headerHeight = useHeaderHeight();
  const translationsPath = 'onboarding_pages.enter_country.modal';
  const filteredOptions = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return Object.values(countryOptions).filter(({name}) => name.toLowerCase().includes(searchTerm));
  }, [search]);

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
      onBackButtonPress={onClose}
      onModalWillHide={() => {
        if (selectedCountry) {
          Keyboard.dismiss();
        }
      }}
      onModalHide={() => onModalHide?.(hideReason)}>
      <KeyboardAvoidingView
        activeOn={['ios', 'android']}
        style={{
          flex: 1,
          pointerEvents: 'box-none',
        }}>
        <ModalContentContainer style={{marginTop: headerHeight - PROGRESS_BAR_LAYOUT_HEIGHT}}>
          <CloseIcon onPress={onClose} />
          <View style={{gap: 24, flex: 1}}>
            <SSITextH1LightStyled>{translate(`${translationsPath}.title`)}</SSITextH1LightStyled>
            <OnboardingSearchField value={search} onChangeText={setSearch} autoFocus={false} />
            {filteredOptions.map(option => (
              <CountrySelectOption key={option.name} option={{...option, selected: option.name === selectedCountry}} onSelect={setSelectedCountry} />
            ))}
          </View>
          <PrimaryButton
            style={{marginTop: 24, width: '100%'}}
            caption={translate('action_select_label')}
            disabled={!selectedCountry}
            onPress={() => {
              if (selectedCountry) {
                setHideReason('select');
                onSelect(selectedCountry);
              }
            }}
          />
        </ModalContentContainer>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CountrySelectionModal;
