import {useFocusEffect} from '@react-navigation/native';
import {BarcodeScanningResult, Camera} from 'expo-camera';
import {useContext, useEffect, useState} from 'react';
import SSIQRCustomMarker from '../../components/qrCodes/SSIQRCustomMarker';
import {translate} from '../../localization/Localization';
import {ShareContext} from '../../navigation/machines/shareStateNavigation';
import {SSIQRReaderScreenScannerStyled as QRScanner, SSIBasicContainerStyled} from '../../styles/components';
import {ShareMachineEvents} from '../../types/machines/share';

// This is a dummy value, useless when qr is properly validated
const isQrValid = true;

const ScanQrScreen = () => {
  const {shareInstance} = useContext(ShareContext);
  const [scanned, setScanned] = useState(false);
  const onBarcodeScanned = (readEvent?: BarcodeScanningResult) => {
    if (scanned) {
      return;
    }
    // validate the barcode similarly to the qr service.
    // Was not trivial to hook up to the machine service, hence skipped
    if (!isQrValid) {
      shareInstance.send(ShareMachineEvents.SET_QR_ERROR, {data: true});
    } else {
      shareInstance.send(ShareMachineEvents.SET_QR_PAYLOAD, {data: readEvent?.data});
      shareInstance.send(ShareMachineEvents.NEXT);
    }
    setScanned(true);
  };

  useFocusEffect(() => {
    setScanned(false);
    // This is just for testing on the emulator. Remove and adjust the above callback
    setTimeout(onBarcodeScanned, 1000);
  });

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

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

  return (
    <SSIBasicContainerStyled>
      <QRScanner
        onBarcodeScanned={onBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}>
        <SSIQRCustomMarker title={translate('qr_scanner_marker_title')} subtitle={translate('qr_scanner_marker_subtitle')} />
      </QRScanner>
    </SSIBasicContainerStyled>
  );
};

export default ScanQrScreen;
