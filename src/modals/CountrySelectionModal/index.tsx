import {useHeaderHeight} from '@react-navigation/elements';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {TCountryCode} from 'countries-list';
import React, {useMemo} from 'react';
import {FlatList, Keyboard, View, useWindowDimensions} from 'react-native';
import Modal from 'react-native-modal';
import {DETAILS_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import {PROGRESS_BAR_LAYOUT_HEIGHT} from '../../components/bars/onboarding';
import KeyboardAvoidingView from '../../components/containers/KeyboardAvoidingView';
import CountrySelectOption from '../../components/fields/CountrySelectOption';
import OnboardingSearchField from '../../components/fields/OnboardingSearchField';
import {useAccessibility} from '../../hooks/useAccessibility';
import {translate} from '../../localization/Localization';
import {CloseIcon, ModalContentContainer, SSITextH1LightStyled} from '../../styles/components';
import {countryOptions} from '../../utils';

type HideReason = 'close' | 'select';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedCountry: TCountryCode) => void;
  onModalHide?: (reason?: HideReason) => void;
  selected?: TCountryCode;
};

const CountrySelectionModal = ({open, selected, onClose, onSelect, onModalHide}: Props) => {
  const {height: screenHeight} = useWindowDimensions();
  const [hideReason, setHideReason] = React.useState<HideReason>();
  const [selectedCountry, setSelectedCountry] = React.useState<TCountryCode | undefined>(selected);
  const {isScreenReaderEnabled, setFocus, announce} = useAccessibility();
  const [search, setSearch] = React.useState('');
  const headerHeight = useHeaderHeight();
  const translationsPath = 'onboarding_pages.enter_country.modal';
  const filteredOptions = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return Object.values(countryOptions).filter(({label}) => label.toLowerCase().includes(searchTerm));
  }, [search]);
  const titleRef = React.useRef(null);
  const listRef = React.useRef<FlatList>(null);
  React.useEffect(() => {
    announce({message: 'Modal opened'});
    console.log(titleRef);
    console.log('setting focus');
    setFocus(titleRef, 500);
  }, [isScreenReaderEnabled, titleRef.current]);
  return (
    <Modal
      importantForAccessibility="no"
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
        importantForAccessibility="no"
        activeOn={['ios', 'android']}
        style={{
          flex: 1,
          pointerEvents: 'box-none',
        }}>
        <ModalContentContainer importantForAccessibility="no" style={{marginTop: headerHeight - PROGRESS_BAR_LAYOUT_HEIGHT}}>
          <CloseIcon accessibilityLabel="Closes the country selection modal" onPress={onClose} />
          <View style={{gap: 24, flex: 1}} importantForAccessibility="no">
            <SSITextH1LightStyled ref={titleRef} accessibilityRole="header">
              {translate(`${translationsPath}.title`)}
            </SSITextH1LightStyled>
            <OnboardingSearchField value={search} onChangeText={setSearch} onSubmitEditing={() => setFocus(listRef)} autoFocus={false} />
            <FlatList
              ref={listRef}
              keyExtractor={({countryCode}) => countryCode}
              initialNumToRender={DETAILS_INITIAL_NUMBER_TO_RENDER}
              removeClippedSubviews
              data={filteredOptions}
              renderItem={({item}) => (
                <CountrySelectOption
                  option={{...item, selected: item.countryCode === selectedCountry}}
                  onSelect={isScreenReaderEnabled ? onSelect : setSelectedCountry}
                />
              )}
              style={{flex: 1}}
              accessibilityRole="radiogroup"
              accessibilityLabel="Country options"
              accessibilityHint={`Currently selected country is ${selectedCountry}`}
              showsVerticalScrollIndicator={false}
            />
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
