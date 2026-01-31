import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BarcodeScanningResult, Camera, CameraView} from 'expo-camera';
import React, {FC, useEffect, useRef, useState} from 'react';
import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
import SSIQRCustomMarker from '../../components/qrCodes/SSIQRCustomMarker';
import {translate} from '../../localization/Localization';
import {onQRScanned} from '../../services/qrService';
import {SSIBasicContainerStyled} from '../../styles/components';
import {PlatformsEnum, ScreenRoutesEnum, StackParamList} from '../../types';
import {Chat} from '../../components/chat/Chat';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.QR_READER>;

const SSIQRReaderScreen: FC<Props> = (props: Props): JSX.Element => {
  const hasScannedRef = useRef(false);

  const onBarcodeScanned = async (readEvent: BarcodeScanningResult): Promise<void> => {
    if (hasScannedRef.current) {
      return;
    }
    hasScannedRef.current = true;
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
        <View style={StyleSheet.absoluteFill}>
          <CameraView
            mute
            onBarcodeScanned={onBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            style={StyleSheet.absoluteFill}
          />
          <SSIQRCustomMarker title={translate('qr_scanner_marker_title')} subtitle={translate('qr_scanner_marker_subtitle')} />
        </View>
      )}

      <Chat screenContext="you are in the qr scanner screen. User can point the camera at a qr code provided by an issuer to scan it." />
    </SSIBasicContainerStyled>
  );
};

export default SSIQRReaderScreen;
