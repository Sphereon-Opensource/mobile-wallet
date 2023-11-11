import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {View} from 'react-native';

import {v4 as uuid} from 'uuid';
import {PIN_CODE_LENGTH} from '../../../@config/constants';
import SSIPinCode from '../../../components/pinCodes/SSIPinCode';
import {translate} from '../../../localization/Localization';
import {SSIBasicHorizontalCenterContainerStyled as Container, SSIStatusBarDarkModeStyled as StatusBar} from '../../../styles/components';
import {PinCodeMode, ScreenRoutesEnum, StackParamList} from '../../../types';

type PinCodeSetProps = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.PIN_CODE_SET>;

const SSIPinCodeSetScreen: FC<PinCodeSetProps> = (props: PinCodeSetProps): JSX.Element => {
  useBackHandler(() => {
    void props.route.params.onBack();
    // make sure event stops here
    return true;
  });

  const onVerification = async (value: string): Promise<void> => {
    await props.route.params.onNext(value);
  };

  return (
    <Container>
      <StatusBar />
      <View style={{marginTop: 110}} id={PinCodeMode.CHOOSE_PIN}>
        <SSIPinCode
          key={`${PinCodeMode.CHOOSE_PIN}-${uuid()}`}
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

export default SSIPinCodeSetScreen;
