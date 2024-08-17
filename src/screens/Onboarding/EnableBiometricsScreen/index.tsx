import {buttonColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';

const EnableBiometricsScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  return (
    <ScreenContainer>
      <ScreenTitleAndDescription title="Enable Biometrics" />
      <PrimaryButton
        style={{height: 42, width: 300}}
        caption={translate('action_next_label')}
        backgroundColors={[buttonColors[100]]}
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
    </ScreenContainer>
  );
};

export default EnableBiometricsScreen;
