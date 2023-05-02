import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';

import {PIN_CODE_LENGTH} from '../../@config/constants';
import SSIPinCode from '../../components/pinCodes/SSIPinCode';
import {translate} from '../../localization/Localization';
import {getPin} from '../../services/storageService';
import {
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSILockScreenPinCodeContainerStyled as PinCodeContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.LOCK>;

// TODO This screen should be extended to do pin code or biometrics authentication
const SSILockScreen: FC<Props> = (props: Props): JSX.Element => {
  const onVerification = async (value: string): Promise<void> => {
    const {onAuthenticate} = props.route.params;

    // TODO We are currently only supporting a single user right now
    if (value !== (await getPin())) {
      return Promise.reject('Invalid pin code');
    }
    await onAuthenticate();
  };

  return (
    <Container>
      <StatusBar />
      <PinCodeContainer>
        <SSIPinCode
          length={PIN_CODE_LENGTH}
          accessibilityLabel={translate('pin_code_accessibility_label')}
          accessibilityHint={translate('pin_code_accessibility_hint')}
          errorMessage={translate('pin_code_invalid_code_message')}
          onVerification={onVerification}
        />
      </PinCodeContainer>
    </Container>
  );
};

export default SSILockScreen;
