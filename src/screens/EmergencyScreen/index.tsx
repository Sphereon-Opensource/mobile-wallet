import React, {FC, useEffect, useState} from 'react';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {backgroundColors, fontColors, buttonColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {translate} from '../../localization/Localization';
import {EMERGENCY_ALERT_DELAY} from '../../@config/constants';
import {
  EmergencyScreenContainerStyled as Container,
  SSIStatusBarDarkModeStyled as StatusBar,
  EmergencyScreenCountdownOuterContainerStyled as CountdownOuterContainer,
  EmergencyScreenCountdownMiddleContainerStyled as CountdownMiddleContainer,
  EmergencyScreenCountdownInnerContainerStyled as CountdownInnerContainer,
  EmergencyScreenButtonContainerStyled as ButtonContainer,
  EmergencyScreenCountdownTextStyled as CountdownText,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.EMERGENCY>;

const EmergencyScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const [countdown, setCountdown] = useState<number>(EMERGENCY_ALERT_DELAY);

  // FIXME WAL-681 remove work around https://github.com/react-navigation/react-navigation/issues/11139
  void changeNavigationBarColor(backgroundColors.orange);

  useEffect(() => {
    const interval: NodeJS.Timeout = setInterval((): void => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        clearInterval(interval);
        void onSend();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const onAbort = async (): Promise<void> => {
    navigation.goBack();
  };

  const onSend = async (): Promise<void> => {
    console.log('Trigger alarm pressed');
  };

  return (
    <Container>
      <StatusBar backgroundColor={backgroundColors.orange} />
      <CountdownOuterContainer>
        <CountdownMiddleContainer>
          <CountdownInnerContainer>
            <CountdownText>{countdown}</CountdownText>
          </CountdownInnerContainer>
        </CountdownMiddleContainer>
      </CountdownOuterContainer>
      <ButtonContainer>
        <SecondaryButton
          style={{height: 42, width: 300}}
          borderColors={[fontColors.light]}
          captionColor={fontColors.light}
          caption={translate('emergency_abort_button_caption')}
          onPress={onAbort}
        />
        <PrimaryButton
          style={{height: 42, width: 300}}
          caption={translate('emergency_send_button_caption')}
          backgroundColors={[buttonColors[100]]}
          captionColor={fontColors.light}
          onPress={onSend}
        />
      </ButtonContainer>
    </Container>
  );
};

export default EmergencyScreen;
