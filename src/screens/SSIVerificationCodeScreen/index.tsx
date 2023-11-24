import React, {FC} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useBackHandler} from '@react-native-community/hooks';
import {VERIFICATION_CODE_MAX_RETRIES} from '../../@config/constants';
import SSIPinCode from '../../components/pinCodes/SSIPinCode';
import {translate} from '../../localization/Localization';
import {toLocalDateTimeString} from '../../utils/DateUtils';
import {
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSIVerificationCodeScreenPinCodeContainerStyled as PinCodeContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {MainRoutesEnum, PopupImagesEnum, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.VERIFICATION_CODE>;

const SSIVerificationCodeScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const {pinLength, credentialName, onVerification, onBack} = props.route.params;

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

  const onMaxRetriesExceeded = async (): Promise<void> => {
    navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      image: PopupImagesEnum.SECURITY,
      title: translate('verification_code_invalid_code_title'),
      details: translate('verification_code_invalid_code_details'),
      detailsPopup: {
        buttonCaption: translate('action_view_extra_details'),
        title: translate('verification_code_invalid_code_details_title'),
        details: '<b>Error Details:</b> Invalid OpenID token hint PIN provided.', // TODO WAL-277 get this information from the auth process once we have it
        extraDetails: `<b>Timestamp:</b> ${toLocalDateTimeString(new Date().getTime())}\n<b>Correlationid:</b> uDVppai+Q0mlGbosRL4M5w.9`, // TODO WAL-277 get this information from the auth process once we have it
      },
      primaryButton: {
        caption: translate('action_ok_label'),
        onPress: async (): Promise<void> => navigation.navigate(ScreenRoutesEnum.QR_READER, {}),
      },
    });
  };

  return (
    <Container>
      <StatusBar />
      <PinCodeContainer>
        <SSIPinCode
          maxRetries={VERIFICATION_CODE_MAX_RETRIES}
          length={pinLength}
          accessibilityLabel={translate('verification_code_accessibility_label')}
          accessibilityHint={translate('verification_code_accessibility_hint')}
          onMaxRetriesExceeded={onMaxRetriesExceeded}
          onVerification={onVerification}
          errorMessage={translate('verification_code_invalid_code_message')}
        />
      </PinCodeContainer>
    </Container>
  );
};

export default SSIVerificationCodeScreen;
