import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC, useEffect, useState} from 'react';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {backgroundColors} from '@sphereon/ui-components.core';
import SSIPinCode from '../../components/pinCodes/SSIPinCode';
import {storageGetPin} from '../../services/storageService';
import {translate} from '../../localization/Localization';
import {PIN_CODE_LENGTH} from '../../@config/constants';
import {
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSILockScreenPinCodeContainerStyled as PinCodeContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import BadgeButton from '../../components/buttons/BadgeButton';
import {getVerifiableCredentialsFromStorage} from '../../services/credentialService';
import {UniqueVerifiableCredential} from '@veramo/core';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.LOCK>;

// TODO This screen should be extended to do pin code or biometrics authentication
const SSILockScreen: FC<Props> = (props: Props): JSX.Element => {
  // FIXME WAL-681 remove work around https://github.com/react-navigation/react-navigation/issues/11139
  const [emergencyButtonVisible, setEmergencyButtonVisible] = useState(false);
  useEffect((): void => {
    props.navigation.addListener('focus', (): void => {
      void changeNavigationBarColor(backgroundColors.primaryDark);
    });
    getVerifiableCredentialsFromStorage().then(async (credentials: Array<UniqueVerifiableCredential>): Promise<void> => {
      const dec112Credential = credentials.find(c => c.verifiableCredential.type && c.verifiableCredential.type.indexOf('DEC112Credential') > -1);
      if (dec112Credential) {
        setEmergencyButtonVisible(true);
      }
    });
  }, []);

  const onVerification = async (value: string): Promise<void> => {
    const {onAuthenticate} = props.route.params;

    // TODO We are currently only supporting a single user right now
    if (value !== (await storageGetPin())) {
      return Promise.reject('Invalid pin code');
    }
    await onAuthenticate();
  };

  const onEmergencyCall = async (): Promise<void> => {
    props.navigation.navigate(ScreenRoutesEnum.EMERGENCY, {});
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
      {emergencyButtonVisible ? (
        <BadgeButton
          caption={translate('lock_emergency_button_caption')}
          onPress={onEmergencyCall}
          style={{marginRight: 'auto', marginLeft: 'auto', marginBottom: 34, marginTop: 40}}
        />
      ) : null}
    </Container>
  );
};

export default SSILockScreen;
