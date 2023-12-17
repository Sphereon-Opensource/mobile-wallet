import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC, useEffect} from 'react';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {backgroundColors} from '@sphereon/ui-components.core';
import BadgeButton from '../../components/buttons/BadgeButton';
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

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.LOCK>;

// TODO This screen should be extended to do pin code or biometrics authentication
const SSILockScreen: FC<Props> = (props: Props): JSX.Element => {
  // FIXME WAL-681 remove work around https://github.com/react-navigation/react-navigation/issues/11139
  useEffect((): void => {
    props.navigation.addListener('focus', (): void => {
      void changeNavigationBarColor(backgroundColors.primaryDark);
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
      {/*<BadgeButton*/}
      {/*  caption={translate('lock_emergency_button_caption')}*/}
      {/*  onPress={onEmergencyCall}*/}
      {/*  // FIXME would be nice if we could turn this into a styled components, but for some reason the styling is not working then when passed as a prop*/}
      {/*  style={{marginTop: 'auto', marginRight: 'auto', marginLeft: 26, marginBottom: 34}}*/}
      {/*/>*/}
    </Container>
  );
};

export default SSILockScreen;
