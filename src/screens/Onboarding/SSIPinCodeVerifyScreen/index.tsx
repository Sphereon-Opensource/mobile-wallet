import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {View} from 'react-native';

import {PIN_CODE_LENGTH} from '../../../@config/constants';
import SSIPinCode from '../../../components/pinCodes/SSIPinCode';
import {translate} from '../../../localization/Localization';
import {SSIBasicHorizontalCenterContainerStyled as Container, SSIStatusBarDarkModeStyled as StatusBar} from '../../../styles/components';
import {PinCodeMode, ScreenRoutesEnum, StackParamList} from '../../../types';

type PinCodeVerifyProps = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.PIN_CODE_VERIFY>;

const SSIPinCodeVerifyScreen: FC<PinCodeVerifyProps> = (props: PinCodeVerifyProps): JSX.Element => {
  useBackHandler(() => {
    void props.route.params.onBack();
    // make sure event stops here
    return true;
  });

  const onVerification = async (value: string): Promise<void> => {
    if (value !== props.route.params.context.pinCode) {
      return Promise.reject(Error('Invalid code'));
    }
    await props.route.params.onNext(value);
  };

  return (
    <Container>
      <StatusBar />
      <View style={{marginTop: 127}} id={PinCodeMode.CHOOSE_PIN}>
        <SSIPinCode
          key={PinCodeMode.CONFIRM_PIN}
          length={PIN_CODE_LENGTH}
          accessibilityLabel={translate('pin_code_accessibility_label')}
          accessibilityHint={translate('pin_code_accessibility_hint')}
          errorMessage={translate('pin_code_invalid_code_message')}
          onVerification={onVerification}
        />
      </View>
    </Container>
  );
};

export default SSIPinCodeVerifyScreen;
