import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {Dimensions, Image} from 'react-native';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {ButtonContainer, Container, ContentContainer, Text, Title, TitleContainer} from '../components/styles';
import {
  InformationIconContainer,
  ProviderCardRow,
  ProviderContainer,
  ProviderDescription,
  ProviderImage,
  ProviderImageContainer,
  ProviderLabel,
  ProviderMiniCardImage,
  ProviderText,
  ProviderTitle,
  ProviderUrl,
  RequestedInformationContainer,
  RequestedInformationLabel,
  RequestedInformationRow,
  ScrollableContent,
  SectionLabel,
  SubTitle,
} from './components/styles';
import {translate} from '../../../localization/Localization';
import {AusweisRequestedInfoSchema, InfoSchemaImages} from './constants';

const {width} = Dimensions.get('window');

const ImportDataConsentScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);

  return (
    <Container>
      <ScrollableContent>
        <TitleContainer>
          <Title>{translate('import_data_consent_title')}</Title>
          <SubTitle>{translate('import_data_consent_subtitle')}</SubTitle>
        </TitleContainer>
        <ContentContainer>
          <ProviderLabel>{translate('import_data_consent_pid_provider_title')}</ProviderLabel>
          <ProviderContainer>
            <ProviderImageContainer>
              <ProviderImage source={require('../../../assets/images/PlaceholderLogo.png')} width={40} height={40} resizeMode="stretch" />
            </ProviderImageContainer>
            <ProviderDescription>
              <ProviderTitle>Bundesdruckerei</ProviderTitle>
              <ProviderText>{translate('import_data_consent_pid_provider_subheading')}</ProviderText>
              <ProviderUrl>www.personalausweisportal.de</ProviderUrl>
            </ProviderDescription>
          </ProviderContainer>
          <SectionLabel>{translate('import_data_consent_offered_data_title')}</SectionLabel>
          <ProviderCardRow>
            <ProviderMiniCardImage>
              <Image
                width={20}
                height={20}
                resizeMode="stretch"
                style={{width: 40, height: 40}}
                source={require('../../../assets/images/ausweis_icon.png')}
              />
            </ProviderMiniCardImage>
            <ProviderDescription>
              <ProviderLabel>Ausweis eID</ProviderLabel>
              <ProviderText>German Bundesdruckerei</ProviderText>
            </ProviderDescription>
          </ProviderCardRow>
          <RequestedInformationContainer>
            {AusweisRequestedInfoSchema.map(info => (
              <RequestedInformationRow key={info.label}>
                <InformationIconContainer>
                  <Image style={{height: 20, width: 20}} resizeMode="stretch" source={InfoSchemaImages[info.icon]} width={20} height={20} />
                </InformationIconContainer>
                <RequestedInformationLabel>{info.label}</RequestedInformationLabel>
              </RequestedInformationRow>
            ))}
          </RequestedInformationContainer>
        </ContentContainer>
      </ScrollableContent>
      <ButtonContainer>
        <PrimaryButton
          style={{width: width - 40}}
          caption={translate('import_data_consent_button_accept')}
          backgroundColors={['#7276F7', '#7C40E8']}
          captionColor={fontColors.light}
          onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
        />
        <SecondaryButton
          style={{width: width - 40}}
          caption={translate('import_data_consent_button_decline')}
          borderColors={['#7276F7', '#7C40E8']}
          onPress={() => onboardingInstance.send(OnboardingMachineEvents.SKIP_IMPORT)}
        />
      </ButtonContainer>
    </Container>
  );
};

export default ImportDataConsentScreen;
