import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {useContext, useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {ImportInformationSummary} from '../ImportDataConsentScreen/components/ImportInformationSummary';
import {ContentContainer, Title, TitleContainer} from '../components/styles';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import {convertFromPIDPayload} from '../ImportDataConsentScreen/util';
import SSIButtonsContainer from '../../../components/containers/SSIButtonsContainer';

const ImportDataFinalScreen = (props?: any) => {
  const {onAccept, credentials, onDecline, isShareFlow} = props?.route?.params ?? {};

  const {onboardingInstance} = useContext(OnboardingContext);
  const {pidCredentials} = credentials ? {pidCredentials: credentials} : onboardingInstance.getSnapshot().context;

  const data = useMemo(() => convertFromPIDPayload(pidCredentials[0].uniformCredential.credentialSubject, 'import'), []);

  const footer = isShareFlow ? (
    <SSIButtonsContainer
      secondaryButton={{
        caption: translate('action_decline_label'),
        onPress: onDecline,
      }}
      primaryButton={{
        caption: translate('action_accept_label'),
        onPress: onAccept,
      }}
    />
  ) : (
    <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
      <PrimaryButton
        caption={translate('import_data_consent_button_accept')}
        onPress={() => (onAccept ? onAccept() : onboardingInstance.send(OnboardingMachineEvents.NEXT))}
      />
      <SecondaryButton
        caption={translate('import_data_consent_button_decline')}
        onPress={() => (onDecline ? onDecline() : onboardingInstance.send(OnboardingMachineEvents.DECLINE_INFORMATION))}
      />
    </View>
  );

  return (
    <ScreenContainer footer={footer}>
      <ScrollView>
        <TitleContainer>
          <Title>{translate(isShareFlow ? 'share_credential_c2_flow_title' : 'import_data_final_step_title')}</Title>
        </TitleContainer>
        <ContentContainer>
          <ImportInformationSummary data={data} />
        </ContentContainer>
      </ScrollView>
    </ScreenContainer>
  );
};

export default ImportDataFinalScreen;
