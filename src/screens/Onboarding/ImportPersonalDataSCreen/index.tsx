import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useCallback, useContext, useEffect, useState} from 'react';
import {Image, Keyboard} from 'react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {AusweisEPinModal} from '../components/AusweisEPinModal';
import {AusweisScanModal, ScanEvents} from '../components/AusweisScanModal';
import {ContentContainer} from '../components/styles';

const ImportPersonalDataScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [scanState, setScanState] = useState(ScanEvents.READY);
  const [progress, setProgress] = useState(0);

  const onScanComplete = () => {
    onboardingInstance.send(OnboardingMachineEvents.NEXT);
  };

  const translationsPath = 'onboarding_pages.import_scan_card';
  const transition = () => {
    if (scanState === ScanEvents.COMPLETE) return setScanState(ScanEvents.NONE);
    if (scanState === ScanEvents.SCAN) return setScanState(ScanEvents.COMPLETE);
    if (scanState === ScanEvents.READY) return setScanState(ScanEvents.SCAN);
    if (showPin) {
      setShowPin(false);
      setScanState(ScanEvents.READY);
      return;
    }
    setShowPin(true);
  };

  const onCompletePin = (pin: string) => {
    setPin(pin);
    transition();
  };
  const footer = (
    <PrimaryButton
      style={{height: 42, width: '100%'}}
      caption={translate(`${translationsPath}.button_caption`)}
      captionColor={fontColors.light}
      onPress={transition}
    />
  );
  return (
    <ScreenContainer footer={footer}>
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} description={translate(`${translationsPath}.description`)} />
      <ContentContainer>
        <Image source={require('../../../assets/images/scan_card.png')} height={200} width={100} style={{height: 300, width: 200}} />
      </ContentContainer>
      <AusweisEPinModal isVisible={showPin} onClose={() => setShowPin(false)} onComplete={onCompletePin} />
      <AusweisScanModal
        // onScan={() => console.log('scanning')}
        state={scanState}
        progress={progress}
        onCancel={() => setScanState(ScanEvents.NONE)}
      />
    </ScreenContainer>
  );
};

export default ImportPersonalDataScreen;
