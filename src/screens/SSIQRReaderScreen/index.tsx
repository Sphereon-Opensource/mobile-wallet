import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BarcodeScanningResult, Camera, CameraView} from 'expo-camera';
import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {AppState, AppStateStatus, Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
import SSIQRCustomMarker from '../../components/qrCodes/SSIQRCustomMarker';
import {translate} from '../../localization/Localization';
import {onQRScanned} from '../../services/qrService';
import {SSIBasicContainerStyled} from '../../styles/components';
import {PlatformsEnum, ScreenRoutesEnum, StackParamList} from '../../types';
import {Chat} from '../../components/chat/Chat';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.QR_READER>;

const SSIQRReaderScreen: FC<Props> = (props: Props): JSX.Element => {
  const hasScannedRef = useRef(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const appStateRef = useRef(AppState.currentState);
  const isFirstFocusRef = useRef(true);

  // On Android re-entry, briefly unmount and remount the camera
  // to give the OS time to release and reinitialize camera hardware.
  // Skip on first focus (cameraKey <= 1) to avoid delaying initial camera start.
  useEffect(() => {
    if (Platform.OS !== PlatformsEnum.ANDROID || cameraKey <= 1) {
      return;
    }
    setShowCamera(false);
    const timer = setTimeout(() => setShowCamera(true), 50);
    return () => clearTimeout(timer);
  }, [cameraKey]);

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const onBarcodeScanned = async (readEvent: BarcodeScanningResult): Promise<void> => {
    if (hasScannedRef.current) {
      return;
    }
    hasScannedRef.current = true;
    setScanned(true);
    await onQRScanned({qrData: readEvent.data, navigation: props.navigation});
  };

  useFocusEffect(
    useCallback(() => {
      const getCameraPermissions = async () => {
        const {status} = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      };

      getCameraPermissions();
      hasScannedRef.current = false;
      setScanned(false);
      setIsCameraReady(false);
      if (isFirstFocusRef.current) {
        // First focus: mount camera immediately without key bump
        isFirstFocusRef.current = false;
      } else {
        // Re-focus: force a fresh native camera view
        setCameraKey(prev => prev + 1);
      }

      const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
        if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
          // Force a new native camera view when returning from background
          setIsCameraReady(false);
          setCameraKey(prev => prev + 1);
        }
        appStateRef.current = nextState;
      });

      return () => {
        subscription.remove();
      };
    }, []),
  );

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
      {!scanned && showCamera && (
        <View style={StyleSheet.absoluteFill}>
          <CameraView
            key={cameraKey}
            mute
            onCameraReady={handleCameraReady}
            onBarcodeScanned={isCameraReady ? onBarcodeScanned : undefined}
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
