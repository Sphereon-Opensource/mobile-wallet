import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useMemo, useState} from 'react';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import PinCode from '../../../components/pinCodes/OnboardingPinCode';
import {PIN_CODE_LENGTH} from '../../../@config/constants';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import {useAuthEffect} from '../EnableBiometricsScreen/use-biometrics';
import Animated, {useAnimatedKeyboard, useAnimatedStyle} from 'react-native-reanimated';
import {View} from 'react-native';

const ImportDataAuthenticationScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const {
    context: {pinCode: pinCodeContext},
  } = onboardingInstance.getSnapshot();
  const [pinCode, setPinCode] = useState('');
  const doPinsCompletelyMatch = useMemo(() => pinCode === pinCodeContext, [pinCode, pinCodeContext]);

  useAuthEffect((success: boolean) => {
    if (!success) return;
    onboardingInstance.send(OnboardingMachineEvents.NEXT);
  });

  const keyboard = useAnimatedKeyboard();

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: -keyboard.height.value,
        },
      ],
    };
  });

  const footer = (
    <View>
      <Animated.View style={style}>
        <PrimaryButton
          style={{height: 42, width: 300}}
          caption="Next"
          backgroundColors={['#7276F7', '#7C40E8']}
          captionColor={fontColors.light}
          onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
          disabled={!doPinsCompletelyMatch}
        />
      </Animated.View>
    </View>
  );

  return (
    <ScreenContainer disableKeyboardAvoidingView={true} footer={footer}>
      <ScreenTitleAndDescription title={translate('import_data_auth_title')} />
      <PinCode pin={pinCode} onPinChange={setPinCode} length={PIN_CODE_LENGTH} validation={{isValid: doPinsCompletelyMatch}} />
    </ScreenContainer>
  );
};

export default ImportDataAuthenticationScreen;
