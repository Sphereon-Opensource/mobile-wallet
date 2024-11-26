import React, {useState} from 'react';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {SSIBasicModalContainerStyled as Container} from '../../../styles/components';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {fontColors} from '@sphereon/ui-components.core';
import {translate} from '../../../localization/Localization';
import {ESIMActivationStackParamList} from '../../../types';
import SSITextInputControlledField from '../../../components/fields/SSITextInputControlledField';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<ESIMActivationStackParamList, 'EnterESimDetails'>;


const EnterESimDetailsScreen = ({route}: Props): JSX.Element => {
  const {
    onBack,
    onNext,
    onSetMsisdn,
    onSetCouplingCode,
    msisdn: initialMsisdn = '',
    coupledWithCode = '',
  } = route.params;
  const [msisdn, setMsisdn] = useState(initialMsisdn);
  const [couplingCode, setCouplingCode] = useState(coupledWithCode);

  const handleMsisdnChange = (value: string) => {
    setMsisdn(value);
    onSetMsisdn?.(value);
  };

  const handleCouplingCodeChange = (value: string) => {
    if (!coupledWithCode) {
      setCouplingCode(value);
      onSetCouplingCode?.(value);
    }
  };

  const footer = (
    <>
      <PrimaryButton
        accessibilityRole="button"
        style={{height: 42, width: '100%'}}
        caption={translate('onboarding_esim_enter_details_continue')}
        captionColor={fontColors.light}
        disabled={!msisdn || !couplingCode}
        onPress={onNext}
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
      <Container>
        <div className="space-y-6 w-full">
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
          />
        </div>
      </Container>
    </ScreenContainer>
  );
};

export default EnterESimDetailsScreen;
