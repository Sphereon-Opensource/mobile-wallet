import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BarcodeScanningResult, Camera} from 'expo-camera';
import React, {FC, useEffect, useState} from 'react';
import {Platform, StatusBar, Text} from 'react-native';
import SSIQRCustomMarker from '../../components/qrCodes/SSIQRCustomMarker';
import {translate} from '../../localization/Localization';
import {onQRScanned} from '../../services/qrService';
import {SSIBasicContainerStyled, SSIQRReaderScreenScannerStyled as QRScanner} from '../../styles/components';
import {PlatformsEnum, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.QR_READER>;

const SSIQRReaderScreen: FC<Props> = (props: Props): JSX.Element => {
  const onBarcodeScanned = async (readEvent: BarcodeScanningResult): Promise<void> => {
    setScanned(true);
    await onQRScanned({qrData: readEvent.data, navigation: props.navigation});
  };

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      if (hasPermission) {
        return;
      }
      const {status} = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  if (Platform.OS === PlatformsEnum.ANDROID) {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <SSIBasicContainerStyled>
      {!scanned && (
        <QRScanner
          onBarcodeScanned={onBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}>
          <SSIQRCustomMarker title={translate('qr_scanner_marker_title')} subtitle={translate('qr_scanner_marker_subtitle')} />
        </QRScanner>
      )}
    </SSIBasicContainerStyled>
  );
};

export default SSIQRReaderScreen;
