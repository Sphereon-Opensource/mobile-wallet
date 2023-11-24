import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {View} from 'react-native';

import {PIN_CODE_LENGTH} from '../../../@config/constants';
import SSIPinCode from '../../../components/pinCodes/SSIPinCode';
import {translate} from '../../../localization/Localization';
import {SSIBasicHorizontalCenterContainerStyled as Container, SSIStatusBarDarkModeStyled as StatusBar} from '../../../styles/components';
import {PinCodeMode, ScreenRoutesEnum, StackParamList} from '../../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.PIN_CODE_VERIFY>;

const SSIPinCodeVerifyScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const {onNext, onBack, context} = props.route.params;

  useBackHandler((): boolean => {
    if (onBack) {
      void onBack();
      // make sure event stops here
      return true;
    }

    // FIXME for some reason returning false does not execute default behaviour
    navigation.goBack();
    return true;
  });

  const onVerification = async (value: string): Promise<void> => {
    if (value !== context.pinCode) {
      return Promise.reject(Error('Invalid code'));
    }
    await onNext(value);
  };

  return (
    <Container>
      <StatusBar />
      <View style={{marginTop: 127}} id={PinCodeMode.CONFIRM_PIN}>
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
