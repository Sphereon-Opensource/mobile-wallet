import {BarcodeScanningResult, Camera, CameraView} from 'expo-camera';
import React, {FC, useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {SSITextH5LightStyled} from '@sphereon/ui-components.ssi-react-native';
import {translate} from '../../../localization/Localization';

type Props = {
  onScan: (data: string) => void;
};

const SSIInlineQRScanner: FC<Props> = ({onScan}: Props): JSX.Element => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const {status} = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const onBarcodeScanned = (readEvent: BarcodeScanningResult): void => {
    if (hasScannedRef.current) {
      return;
    }
    hasScannedRef.current = true;
    onScan(readEvent.data);
  };

  if (hasPermission === false) {
    return <SSITextH5LightStyled>{translate('trust_anchor_qr_permission')}</SSITextH5LightStyled>;
  }

  if (hasPermission === null) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <CameraView
        mute
        onCameraReady={handleCameraReady}
        onBarcodeScanned={isCameraReady ? onBarcodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 280,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    alignSelf: 'center',
  },
});

export default SSIInlineQRScanner;
