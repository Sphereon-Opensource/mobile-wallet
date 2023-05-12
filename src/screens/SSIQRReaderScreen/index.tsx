import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC, useCallback, useState} from 'react';
import {StatusBar} from 'react-native';
import {BarCodeReadEvent, RNCamera} from 'react-native-camera';

import {QR_SCANNER_TIMEOUT} from '../../@config/constants';
import SSIQRCustomMarker from '../../components/qrCodes/SSIQRCustomMarker';
import {translate} from '../../localization/Localization';
import {readQr} from '../../services/qrService';
import {SSIFullFlexDirectionRowViewStyled as Container, SSIQRReaderScreenScannerStyled as QRScanner} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.QR_READER>;

const SSIQRReaderScreen: FC<Props> = (props: Props): JSX.Element => {
  const onRead = async (readEvent: BarCodeReadEvent): Promise<void> => {
    await readQr({qrData: readEvent.data, navigation: props.navigation});
  };

  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');

  const isFocused = useIsFocused();
  const [isReactivated, setIsReactivated] = useState<boolean>(true);
  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      // Add some custom logic here...
      setIsReactivated(true);
      return () => {
        // Do something when the screen is unfocused
        setIsReactivated(false);
      };
    }, []),
  );

  return (
    <Container>
      {isFocused && (
        <QRScanner
          onRead={onRead}
          reactivate={isReactivated}
          reactivateTimeout={QR_SCANNER_TIMEOUT.reactivate}
          containerStyle={{backgroundColor: 'black'}}
          showMarker
          customMarker={<SSIQRCustomMarker title={translate('qr_scanner_marker_title')} subtitle={translate('qr_scanner_marker_subtitle')} />}
          cameraProps={{
            flashMode: RNCamera.Constants.FlashMode.auto,
          }}
        />
      )}
    </Container>
  );
};

export default SSIQRReaderScreen;
