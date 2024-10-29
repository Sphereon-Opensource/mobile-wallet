import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {Image} from 'react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {SSITextH2SemiBoldLightStyled, SSITextH3LightStyled, SSITextH4LightStyled, SSITextH5LightStyled} from '../../../styles/components';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {ContentContainer} from '../components/styles';
import styled from 'styled-components/native';
import {ImportInformationSummary} from './components/ImportInformationSummary';
import AusweisIcon from '../../../components/assets/icons/AusweisIcon';
import {ProviderCardRow, ProviderContainer, ProviderDescription, ProviderImage, ProviderMiniCardImage, ProviderUrl} from './components/styles';
import {AusweisRequestedInfoSchema} from './constants';

const Label = styled(SSITextH2SemiBoldLightStyled)`
  width: 100%;
`;

const ImportDataConsentScreen = (props?: any) => {
  const {onAccept, onDecline} = props?.route?.params ?? {};

  const {onboardingInstance} = useContext(OnboardingContext);
  const translationsPath = 'onboarding_pages.import_data_consent';
  const footer = (
    <>
      <PrimaryButton
        style={{height: 42, width: '100%'}}
        caption={translate(`${translationsPath}.button_accept`)}
        captionColor={fontColors.light}
        onPress={() => (onAccept ? onAccept() : onboardingInstance.send(OnboardingMachineEvents.NEXT))}
      />
      <SecondaryButton
        style={{height: 42, width: '100%'}}
        caption={translate(`${translationsPath}.button_decline`)}
        borderColors={['#7276F7', '#7C40E8']}
        onPress={() => (onDecline ? onDecline() : onboardingInstance.send(OnboardingMachineEvents.SKIP_IMPORT))}
      />
    </>
  );
  return (
    <ScreenContainer footer={footer} footerStyle={{gap: 12}}>
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} description={translate(`${translationsPath}.subtitle`)} />
      <ContentContainer>
        <Label>{translate(`${translationsPath}.pid_provider_title`)}</Label>
        <ProviderContainer>
          <ProviderImage source={require('../../../assets/images/bundesdruckerei.png')} width={48} height={48} resizeMode="stretch" />
          <ProviderDescription>
            <SSITextH3LightStyled>Bundesdruckerei GmbH</SSITextH3LightStyled>
            <SSITextH4LightStyled>ISSUER</SSITextH4LightStyled>
            <ProviderUrl>https://demo.pid-issuer.bundesdruckerei.de/c</ProviderUrl>
          </ProviderDescription>
        </ProviderContainer>
        <Label>Offered data</Label>
        <ProviderCardRow>
          <ProviderMiniCardImage>
            <AusweisIcon height={45} width={55} />
          </ProviderMiniCardImage>
          <ProviderDescription>
            <SSITextH3LightStyled>Ausweis eID</SSITextH3LightStyled>
            <SSITextH4LightStyled>German Bundesdruckerei</SSITextH4LightStyled>
          </ProviderDescription>
        </ProviderCardRow>
        <ImportInformationSummary data={AusweisRequestedInfoSchema} />
      </ContentContainer>
    </ScreenContainer>
  );
};

export default ImportDataConsentScreen;
