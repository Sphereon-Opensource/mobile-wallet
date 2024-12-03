import React, {useState} from 'react';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {SSIBasicModalContainerStyled as Container} from '../../../styles/components';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {fontColors} from '@sphereon/ui-components.core';
import {translate} from '../../../localization/Localization';
import {ESIMActivationStackParamList, ScreenRoutesEnum} from '../../../types';
import SSITextInputControlledField from '../../../components/fields/SSITextInputControlledField';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {View, StyleSheet} from 'react-native';

type Props = NativeStackScreenProps<ESIMActivationStackParamList, ScreenRoutesEnum.ENTER_ESIM_DETAILS>

const styles = StyleSheet.create({
  fieldsContainer: {
    gap: 24,
    width: '100%',
    paddingHorizontal: 16
  }
});

const EnterESimDetailsScreen = ({route}: Props): JSX.Element => {
  const {
    onBack,
    onNext,
    msisdn: initialMsisdn = '+41796861241',
    coupledWithCode = '',
  } = route.params;
  const [msisdn, setMsisdn] = useState(initialMsisdn);
  const [couplingCode, setCouplingCode] = useState(coupledWithCode);

  const handleMsisdnChange = (value: string) => {
    setMsisdn(value);
  };

  const handleCouplingCodeChange = (value: string) => {
    if (!coupledWithCode) {
      setCouplingCode(value);
    }
  };

  const handleNext = () => {
    void onNext(msisdn, couplingCode);
  };

  const footer = (
    <>
      <PrimaryButton
        accessibilityRole="button"
        style={{height: 42, width: '100%'}}
        caption={translate('onboarding_esim_enter_details_continue')}
        captionColor={fontColors.light}
        disabled={!msisdn || !couplingCode}
        onPress={handleNext}
      />
      <SecondaryButton
        accessibilityRole="button"
        style={{height: 42, width: '100%'}}
        caption={translate('onboarding_esim_enter_details_back')}
        borderColors={['#7276F7', '#7C40E8']}
        onPress={onBack}
      />
    </>
  );

  return (
    <ScreenContainer footer={footer} footerStyle={{gap: 12}}>
      <ScreenTitleAndDescription
        title={translate('onboarding_esim_enter_details_title')}
        description={translate('onboarding_esim_enter_details_description')}
      />
      <Container style={{width: '100%', paddingHorizontal: 0}}>
        <View style={styles.fieldsContainer}>
          <SSITextInputControlledField
            value={msisdn}
            onChangeText={handleMsisdnChange}
            label={translate('onboarding_esim_enter_details_msisdn_label')}
            placeholder={translate('onboarding_esim_enter_details_msisdn_placeholder')}
            keyboardType="phone-pad"
            autoFocus
          />
          <SSITextInputControlledField
            value={couplingCode}
            onChangeText={handleCouplingCodeChange}
            label={translate('onboarding_esim_enter_details_coupling_code_label')}
            placeholder={translate('onboarding_esim_enter_details_coupling_code_placeholder')}
            editable={!coupledWithCode}
            autoCapitalize="characters"
          />
        </View>
      </Container>
    </ScreenContainer>
  );
};

export default EnterESimDetailsScreen;
