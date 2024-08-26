import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {Dimensions} from 'react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
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

const Footer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
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
  const footer = (
    <Footer>
      <Footnote>{translate('biometrics_description')}</Footnote>
      <PrimaryButton caption={translate('biometrics_enable_text')} captionColor={fontColors.light} onPress={handleAuth} />
      <SecondaryButton caption={translate('biometrics_disallow')} onPress={() => onboardingInstance.send(OnboardingMachineEvents.SKIP_BIOMETRICS)} />
    </Footer>
  );
  return (
    <ScreenContainer footer={footer}>
      <ScreenTitleAndDescription title={translate('biometrics_title')} description={translate('biometrics_subtitle')} />
      <Content>
        <CircleWithBorder size={200} backgroundColors={['#7276F799', '#7C40E899']} borderColors={['#7C40E899', '#7C40E866']} borderWidth={30} />
      </Content>
    </ScreenContainer>
  );
};

export default EnableBiometricsScreen;
