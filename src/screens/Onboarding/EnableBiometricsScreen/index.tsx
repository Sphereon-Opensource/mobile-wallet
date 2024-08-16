import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {Dimensions} from 'react-native';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import styled from 'styled-components/native';

import {useBiometrics} from './use-biometrics';
import {CircleWithBorder} from './Circle';
const {width} = Dimensions.get('window');

const Container = styled.View`
  flex: 1;
  background-color: ${backgroundColors.primaryDark};
`;

const Content = styled(Container)`
  display: flex;
  align-items: center;
  padding: 20px;
  justify-content: center;
`;

const Footer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Text = styled.Text`
  color: white;
  font-size: 16px;
  line-height: 24px;
`;

const Title = styled(Text)`
  font-size: 24px;
  line-height: 36px;
  margin-bottom: 12px;
  font-weight: 600;
`;

const TitleSection = styled.View`
  display: flex;
  align-items: stretch;
  padding: 20px;
`;

const Footnote = styled.Text`
  color: white;
  font-size: 11px;
  line-height: 16.5px;
  padding: 20px;
  text-align: center;
`;

const EnableBiometricsScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const {prompt} = useBiometrics();

  const handleAuth = async () => {
    const success = await prompt();
    if (success) onboardingInstance.send(OnboardingMachineEvents.NEXT);
    if (!success) alert('Strong biometrics not enabled or biometrics not enrolled');
  };
  return (
    <Container>
      <TitleSection>
        <Title>{translate('biometrics_title')}</Title>
        <Text>{translate('biometrics_subtitle')}</Text>
      </TitleSection>
      <Content>
        <CircleWithBorder size={200} backgroundColors={['#7276F799', '#7C40E899']} borderColors={['#7C40E899', '#7C40E866']} borderWidth={30} />
      </Content>
      <Footer>
        <Footnote>{translate('biometrics_description')}</Footnote>
        <PrimaryButton
          style={{height: 42, width: width - 40}}
          caption={translate('biometrics_enable_text')}
          captionColor={fontColors.light}
          onPress={handleAuth}
        />
        <SecondaryButton
          style={{height: 42, width: width - 40}}
          caption={translate('biometrics_disallow')}
          onPress={() => onboardingInstance.send(OnboardingMachineEvents.SKIP_BIOMETRICS)}
        />
      </Footer>
    </Container>
  );
};

export default EnableBiometricsScreen;
