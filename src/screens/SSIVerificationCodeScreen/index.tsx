import React, { FC } from 'react'
import { View } from 'react-native'
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack'

import { PopupImagesEnum, QrRoutesEnum, RootRoutesEnum, StackParamList } from '../../@types'
import SSISecondaryButton from '../../components/buttons/SSISecondaryButton'
import { SSIPinCode } from '../../components/pinCodes/SSIPinCode'
import { translate } from '../../localization/Localization'
import {
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSIPinCodeSpacerStyled as PinCodeContainer,
  SSIStatusBarDarkModeStyled as StatusBar
} from '../../styles/styledComponents'

type Props = NativeStackScreenProps<StackParamList, QrRoutesEnum.VERIFICATION_CODE>

const SSIVerificationCodeScreen: FC<Props> = (props: Props): JSX.Element => {
  const { route, navigation } = props

  return (
    <Container>
      <StatusBar />
      <PinCodeContainer>
        <SSIPinCode
          // TODO fix non null assertion
          length={route.params.pinLength!}
          accessibilityLabel={translate('verification_code_accessibility_label')}
          accessibilityHint={translate('verification_code_accessibility_hint')}
          onMaxRetriesExceeded={async () => {
            navigation.navigate(RootRoutesEnum.POPUP_MODAL, {
              image: PopupImagesEnum.SECURITY,
              title: translate('verification_code_invalid_code_title'),
              details: translate('verification_code_invalid_code_details'),
              detailsPopup: {
                buttonCaption: translate('verification_code_invalid_code_details_action'),
                title: translate('verification_code_invalid_code_details_title'),
                details: '<b>Error Details:</b> Invalid OpenID token hint PIN provided.', // TODO WAL-277 get this information from the auth process once we have it
                extraDetails:
                  '<b>Timestamp:</b> 2022-06-16T05:47:21.742Z\n<b>Correlationid:</b> uDVppai+Q0mlGbosRL4M5w.9' // TODO WAL-277 get this information from the auth process once we have it
              },
              primaryButton: {
                caption: translate('verification_code_invalid_code_ok_action'),
                onPress: async () => navigation.navigate(QrRoutesEnum.QR_READER, {})
              }
            })
          }}
          onVerification={route.params.onVerification}
          navigation={navigation}
        />
      </PinCodeContainer>
      {/* Temporary placement of a skip button as functionality for getting vc's via a qr with a pincode is not implemented */}
      <View style={{ width: 200, marginTop: 70, height: 42 }}>
        <SSISecondaryButton
          onPress={async () => await route.params.onVerification('1234')}
          title={'Skip'}
          // TODO move styling to styledComponents (currently there is an issue where this styling prop is not being set correctly)
          style={{ flex: 1 }}
        />
      </View>
    </Container>
  )
}

export default SSIVerificationCodeScreen
