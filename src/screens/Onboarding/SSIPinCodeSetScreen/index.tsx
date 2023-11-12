import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {View} from 'react-native';
import {v4} from 'uuid';
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

  // We always set the pincode to an empty value for this screen
  props.route.params.context.pinCode = '';

  // We use a UUID in the key to ensure we always refresh the pincode on the Set screen
  return (
    <Container>
      <StatusBar />
      <View style={{marginTop: 110}} id={PinCodeMode.CHOOSE_PIN}>
        <SSIPinCode
          key={`${PinCodeMode.CHOOSE_PIN}-${v4()}`}
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
