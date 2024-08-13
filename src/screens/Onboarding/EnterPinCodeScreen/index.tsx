import {buttonColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {Text, View} from 'react-native';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';

const EnterPinCodeScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  return (
    <View>
      <Text>Enter Pin code</Text>
      <PrimaryButton
        style={{height: 42, width: 300}}
        caption={translate('action_next_label')}
        backgroundColors={[buttonColors[100]]}
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
    </View>
  );
};

export default EnterPinCodeScreen;
