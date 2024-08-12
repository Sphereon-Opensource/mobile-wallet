import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {Image, ScrollView} from 'react-native';
import styled from 'styled-components/native';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {ButtonContainer, Container, ContentContainer, Text, Title, TitleContainer} from '../components/styles';

const ScrollableContent = styled(ScrollView)`
  flex: 1;
`;

const ProviderLabel = styled.Text`
  color: white;
  font-weight: 600;
  font-size: 14px;
  width: 100%;
  text-align: left;
`;

const SectionLabel = styled(ProviderLabel)``;

const ProviderTitle = styled(ProviderLabel)`
  margin-bottom: 0px;
`;

const SubTitle = styled(Text)`
  margin-bottom: 24px;
`;

const ProviderContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 20px;

  gap: 5px;

  border: 1px solid #5d6990;
  border-radius: 8px;

  margin-top: 10px;
  margin-bottom: 24px;

  width: 100%;
`;

const RequestedInformationContainer = styled(ProviderContainer)`
  background-color: #2c334b;
  flex-direction: column;
  padding: 10px 20px;
  gap: 5px;
`;

const RequestedInformationRow = styled.View`
  display: flex;
  flex-direction: row;
  padding: 5px 0px;
  align-items: center;
  gap: 10px;
`;

const ProviderText = styled.Text`
  color: white;
  font-size: 12px;
`;

const ProviderImageContainer = styled.View`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProviderImage = styled.Image`
  width: 30px;
  height: 30px;
`;

const ProviderUrl = styled(ProviderText)`
  margin-top: 6px;
`;

const ProviderDescription = styled.View`
  flex: 4;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 5px;
`;

const ProviderCardRow = styled(ProviderContainer)`
  border-width: 0;
  padding: 0px 0px 0px 0px;
  gap: 12px;
  display: flex;
  align-items: stretch;
`;

const ProviderMiniCardImage = styled.View`
  width: 60px;
  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 10px;
  background-color: white;
  padding: 10px 50px;
`;

const InformationIconContainer = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 10px;
`;

const InformationIcon = styled.Image`
  width: 30px;
  height: 30px;
`;

const RequestedInformationLabel = styled.Text`
  color: white;
  font-size: 11px;
  font-weight: 400;
`;

const AusweisRequestedInfoSchema = ['given name', 'family name', 'also known as', 'gender', 'birth date', 'place of birth'] as const;

const ImportDataConsentScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  return (
    <Container>
      <ScrollableContent>
        <TitleContainer>
          <Title>Do you want to add this information?</Title>
          <SubTitle>The personal information is very important to have in your wallet. Are you sure you want to add the information?</SubTitle>
        </TitleContainer>
        <ContentContainer>
          <ProviderLabel>PID Provider</ProviderLabel>
          <ProviderContainer>
            <ProviderImageContainer>
              <ProviderImage source={require('../../../assets/images/PlaceholderLogo.png')} width={40} height={40} resizeMode="stretch" />
            </ProviderImageContainer>
            <ProviderDescription>
              <ProviderTitle>Bundesdruckerei</ProviderTitle>
              <ProviderText>Personal Identification Data Provider</ProviderText>
              <ProviderUrl>https://pringles.com</ProviderUrl>
            </ProviderDescription>
          </ProviderContainer>
          <SectionLabel>Offered data</SectionLabel>
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
            {AusweisRequestedInfoSchema.map(label => (
              <RequestedInformationRow key={label}>
                <InformationIconContainer>
                  <InformationIcon source={require('../../../assets/images/scan_icon.png')} width={40} height={40} />
                </InformationIconContainer>
                <RequestedInformationLabel>{label}</RequestedInformationLabel>
              </RequestedInformationRow>
            ))}
          </RequestedInformationContainer>
        </ContentContainer>
      </ScrollableContent>
      <ButtonContainer>
        <PrimaryButton
          style={{height: 42, width: 300}}
          caption="Yes, I want to add this"
          backgroundColors={['#7276F7', '#7C40E8']}
          captionColor={fontColors.light}
          onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
          // onPress={() => transition()}
        />
        <SecondaryButton
          style={{height: 42, width: 300}}
          caption="Decline"
          borderColors={['#7276F7', '#7C40E8']}
          onPress={() => onboardingInstance.send(OnboardingMachineEvents.PREVIOUS)}
        />
      </ButtonContainer>
    </Container>
  );
};

export default ImportDataConsentScreen;
