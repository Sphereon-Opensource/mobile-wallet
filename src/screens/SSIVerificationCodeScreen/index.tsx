import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';

import {VERIFICATION_CODE_MAX_RETRIES} from '../../@config/constants';
import SSIPinCode from '../../components/pinCodes/SSIPinCode';
import {translate} from '../../localization/Localization';
import {
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSIVerificationCodeScreenPinCodeContainerStyled as PinCodeContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {MainRoutesEnum, PopupImagesEnum, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.VERIFICATION_CODE>;

const SSIVerificationCodeScreen: FC<Props> = (props: Props): JSX.Element => {
  const {route, navigation} = props;

  const onMaxRetriesExceeded = async (): Promise<void> => {
    navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      image: PopupImagesEnum.SECURITY,
      title: translate('verification_code_invalid_code_title'),
      details: translate('verification_code_invalid_code_details'),
      detailsPopup: {
        buttonCaption: translate('action_view_extra_details'),
        title: translate('verification_code_invalid_code_details_title'),
        details: '<b>Error Details:</b> Invalid OpenID token hint PIN provided.', // TODO WAL-277 get this information from the auth process once we have it
        extraDetails: '<b>Timestamp:</b> 2022-06-16T05:47:21.742Z\n<b>Correlationid:</b> uDVppai+Q0mlGbosRL4M5w.9', // TODO WAL-277 get this information from the auth process once we have it
      },
      primaryButton: {
        caption: translate('action_ok_label'),
        onPress: async () => navigation.navigate(ScreenRoutesEnum.QR_READER, {}),
      },
    });
  };

  return (
    <Container>
      <StatusBar />
      <PinCodeContainer>
        <SSIPinCode
          maxRetries={VERIFICATION_CODE_MAX_RETRIES}
          length={route.params.pinLength}
          accessibilityLabel={translate('verification_code_accessibility_label')}
          accessibilityHint={translate('verification_code_accessibility_hint')}
          onMaxRetriesExceeded={onMaxRetriesExceeded}
          onVerification={route.params.onVerification}
          errorMessage={translate('verification_code_invalid_code_message')}
        />
      </PinCodeContainer>
    </Container>
  );
};

export default SSIVerificationCodeScreen;
