import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {buttonColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {Text, View} from 'react-native';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {ScreenRoutesEnum, StackParamList} from '../../../types';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.WELCOME>;

const WelcomeScreen = (_: Props) => {
  const {onboardingInstance} = useContext(OnboardingContext);
  return (
    <View>
      <Text>Welcome to SSI</Text>
      <PrimaryButton
        style={{height: 42, width: 300, marginTop: 60}}
        caption="Next"
        backgroundColors={[buttonColors[100]]}
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
    </View>
  );
};

export default WelcomeScreen;
