import React, {useState} from 'react';
import {PrimaryButton, SecondaryButton, SSICheckmarkBadge} from '@sphereon/ui-components.ssi-react-native';
import {SSIBasicModalContainerStyled as Container} from '../../../styles/components';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {translate} from '../../../localization/Localization';
import {ESIMActivationStackParamList, ScreenRoutesEnum} from '../../../types';
import SSITextInputControlledField from '../../../components/fields/SSITextInputControlledField';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {View, StyleSheet} from 'react-native';
import styled from 'styled-components/native';

type Props = NativeStackScreenProps<ESIMActivationStackParamList, ScreenRoutesEnum.ENTER_ESIM_DETAILS>;

const styles = StyleSheet.create({
  fieldsContainer: {
    gap: 24,
    width: '100%',
    paddingHorizontal: 16,
    backgroundColor: backgroundColors.primaryDark,
  },
  readOnlyField: {
    backgroundColor: backgroundColors.secondaryDark,
    opacity: 0.8,
    flex: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 24,
  },
});

const SSICheckmarkBadgeLarge = styled(SSICheckmarkBadge).attrs({
  size: 24,
})``;

const EnterESimDetailsScreen = ({route}: Props): JSX.Element => {
  const {onBack, onNext, msisdn: initialMsisdn = '+41', coupledWithCode = ''} = route.params;
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
      <ScreenTitleAndDescription title={''} description={translate('onboarding_esim_enter_details_description')} />
      <Container style={{width: '100%', paddingHorizontal: 0}}>
        <View style={styles.fieldsContainer}>
          <View style={styles.fieldRow}>
            <SSITextInputControlledField
              value={msisdn}
              onChangeText={handleMsisdnChange}
              label={translate('onboarding_esim_enter_details_msisdn_label')}
              placeholder={translate('onboarding_esim_enter_details_msisdn_placeholder')}
              keyboardType="phone-pad"
              autoFocus
            />
          </View>
          <View style={styles.fieldRow}>
            <SSITextInputControlledField
              value={couplingCode}
              onChangeText={handleCouplingCodeChange}
              label={translate('onboarding_esim_enter_details_coupling_code_label')}
              placeholder={translate('onboarding_esim_enter_details_coupling_code_placeholder')}
              editable={!coupledWithCode}
              autoCapitalize="characters"
              style={coupledWithCode ? styles.readOnlyField : undefined}
            />
            {coupledWithCode && <SSICheckmarkBadgeLarge />}
          </View>
        </View>
      </Container>
    </ScreenContainer>
  );
};

export default EnterESimDetailsScreen;
