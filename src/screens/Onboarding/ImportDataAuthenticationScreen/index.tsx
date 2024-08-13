import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {translate} from '../../../localization/Localization';
import {useContext} from 'react';
import {Container, Title, TitleContainer, Text, ContentContainer, ButtonContainer} from '../components/styles';
import {OnboardingContext} from 'src/navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from 'src/types/machines/onboarding';

const ImportDataAuthenticationScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  return (
    <Container>
      <TitleContainer>
        <Title>{translate('import_data_auth_step_title')}</Title>
      </TitleContainer>
      <ContentContainer>
        <Text>Placeholder for local authentication</Text>
      </ContentContainer>
      <ButtonContainer>
        <PrimaryButton
          style={{height: 42, width: 300}}
          caption="Next"
          backgroundColors={['#7276F7', '#7C40E8']}
          captionColor={fontColors.light}
          onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
        />
      </ButtonContainer>
    </Container>
  );
};

export default ImportDataAuthenticationScreen;
