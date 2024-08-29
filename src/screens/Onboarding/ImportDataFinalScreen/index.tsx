import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useMemo} from 'react';
import {Dimensions, ScrollView, View} from 'react-native';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {ImportInformationSummary} from '../ImportDataConsentScreen/components/ImportInformationSummary';
import {ContentContainer, Title, TitleContainer} from '../components/styles';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import {convertFromPIDPayload} from '../ImportDataConsentScreen/util';

const {width} = Dimensions.get('window');

const ImportDataFinalScreen = (props?: any) => {
  const {onAccept, credentials, onDecline} = props?.route?.params ?? {};

  const {onboardingInstance} = useContext(OnboardingContext);
  const {pidCredentials} = credentials ? {pidCredentials: credentials} : onboardingInstance.getSnapshot().context;

  const data = useMemo(() => convertFromPIDPayload(pidCredentials[0].uniformCredential.credentialSubject), []);

  const footer = (
    <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
      <PrimaryButton
        style={{height: 42, width: width - 80, alignSelf: 'center'}}
        caption={translate('import_data_consent_button_accept')}
        backgroundColors={['#7276F7', '#7C40E8']}
        captionColor={fontColors.light}
        onPress={() => (onAccept ? onAccept() : onboardingInstance.send(OnboardingMachineEvents.NEXT))}
      />
      <SecondaryButton
        style={{alignSelf: 'center', width: width - 40}}
        caption={translate('import_data_consent_button_decline')}
        borderColors={['#7276F7', '#7C40E8']}
        onPress={() => (onDecline ? onDecline() : onboardingInstance.send(OnboardingMachineEvents.DECLINE_INFORMATION))}
      />
    </View>
  );
  return (
    <ScreenContainer footer={footer}>
      <ScrollView>
        <TitleContainer>
          <Title>{translate('import_data_final_step_title')}</Title>
        </TitleContainer>
        <ContentContainer>
          <ImportInformationSummary data={data} />
        </ContentContainer>
      </ScrollView>
    </ScreenContainer>
  );
};

export default ImportDataFinalScreen;
