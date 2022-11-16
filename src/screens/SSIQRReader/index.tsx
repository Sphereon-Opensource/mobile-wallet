import React, { FC } from 'react'
import { StatusBar } from 'react-native'
import { BarCodeReadEvent, RNCamera } from 'react-native-camera'
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack'

import { QR_SCANNER_TIMEOUT } from '../../@config/constants'
import { ScreenRoutesEnum, StackParamList } from '../../@types'
import SSIQRCustomMarker from '../../components/qrCodes/SSIQRCustomMarker'
import { translate } from '../../localization/Localization'
import { readQr } from '../../services/qrService'
import {
  SSIFullFlexDirectionRowViewStyled as Container,
  SSIQRCodeScannerStyled as QRScanner
} from '../../styles/styledComponents'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.QR_READER>

const SSIQRReaderScreen: FC<Props> = (props: Props): JSX.Element => {
  const onRead = async (readEvent: BarCodeReadEvent) => {
    await readQr({ qrData: readEvent.data, navigation: props.navigation })
  }

  return (
    <Container>
      <StatusBar translucent backgroundColor="transparent" />
      <QRScanner
        onRead={onRead}
        reactivate
        reactivateTimeout={QR_SCANNER_TIMEOUT.reactivate}
        showMarker
        customMarker={
          <SSIQRCustomMarker
            title={translate('qr_scanner_marker_title')}
            subtitle={translate('qr_scanner_marker_subtitle')}
          />
        }
        cameraProps={{
          flashMode: RNCamera.Constants.FlashMode.auto
        }}
      />
    </Container>
  )
}

export default SSIQRReaderScreen
