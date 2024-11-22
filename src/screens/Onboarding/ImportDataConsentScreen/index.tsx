import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import AusweisIcon from '../../../components/assets/icons/AusweisIcon';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {SSITextH2SemiBoldLightStyled, SSITextH3LightStyled, SSITextH4LightStyled} from '../../../styles/components';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {ImportInformationSummary} from './components/ImportInformationSummary';
import {ProviderCardRow, ProviderContainer, ProviderDescription, ProviderImage, ProviderMiniCardImage, ProviderUrl} from './components/styles';
import {AusweisRequestedInfoSchema} from './constants';

const Label = styled(SSITextH2SemiBoldLightStyled)`
  width: 100%;
`;

const ContentContainer = styled(View)`
  margin-top: 20px;
  flex: 1;
  align-items: center;
  background-color: transparent;
`;

const ImportDataConsentScreen = (props?: any) => {
  const {onAccept, onDecline} = props?.route?.params ?? {};

  const {onboardingInstance} = useContext(OnboardingContext);
  const translationsPath = 'onboarding_pages.import_data_consent';
  const footer = (
    <>
      <PrimaryButton
        accessibilityRole="button"
        style={{height: 42, width: '100%'}}
        caption={translate(`${translationsPath}.button_accept`)}
        captionColor={fontColors.light}
        onPress={() => (onAccept ? onAccept() : onboardingInstance.send(OnboardingMachineEvents.NEXT))}
      />
      <SecondaryButton
        accessibilityRole="button"
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
        <Label accessibilityRole="header">{translate(`${translationsPath}.pid_provider_title`)}</Label>
        <ProviderContainer
          accessible
          accessibilityLabel="Name: Boohndessdrewckereye GmbH, role: ISSUER, url: https://demo.pid-issuer.bundesdruckerei.de/c">
          <ProviderImage source={require('../../../assets/images/bundesdruckerei.png')} width={48} height={48} resizeMode="stretch" />
          <ProviderDescription>
            <SSITextH3LightStyled>Bundesdruckerei GmbH</SSITextH3LightStyled>
            <SSITextH4LightStyled>ISSUER</SSITextH4LightStyled>
            <ProviderUrl>https://demo.pid-issuer.bundesdruckerei.de/c</ProviderUrl>
          </ProviderDescription>
        </ProviderContainer>
        <Label accessibilityRole="header">Offered data</Label>
        <ProviderCardRow>
          <ProviderMiniCardImage accessibilityRole="image" accessibilityLabel="Ausweis e ID logo">
            <AusweisIcon height={45} width={55} />
          </ProviderMiniCardImage>
          <ProviderDescription
            accessible
            // sorry had to
            accessibilityLabel="Card: Ausweis e ID, Issuer: German Boohndessdrewckereye">
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
