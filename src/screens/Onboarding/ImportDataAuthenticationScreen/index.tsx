import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {Container, ContentContainer, Text, Title, TitleContainer} from '../components/styles';

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
      <PrimaryButton
        style={{height: 42, width: 300}}
        caption="Next"
        backgroundColors={['#7276F7', '#7C40E8']}
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
    </Container>
  );
};

export default ImportDataAuthenticationScreen;
