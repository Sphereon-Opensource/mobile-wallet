import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useCallback, useContext, useState} from 'react';
import {Image, Keyboard} from 'react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {AusweisEPinModal} from '../components/AusweisEPinModal';
import {AusweisScanModal} from '../components/AusweisScanModal';
import {ContentContainer} from '../components/styles';

const ImportPersonalDataScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [scanning, setScanning] = useState(false);
  const translationsPath = 'onboarding_pages.import_scan_card';
  const transition = useCallback(() => {
    if (scanning) return setScanning(false);
    if (showPin) {
      setShowPin(false);
      setScanning(true);
      return;
    }
    setShowPin(true);
  }, [scanning, setScanning, showPin, setShowPin]);

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
      <ContentContainer
        onPress={() => {
          console.log('pressed');
          setShowPin(false);
          Keyboard.dismiss();
        }}>
        <Image source={require('../../../assets/images/scan_card.png')} height={200} width={100} style={{height: 300, width: 200}} />
      </ContentContainer>
      <AusweisEPinModal isVisible={showPin} onClose={() => setShowPin(false)} onComplete={onCompletePin} />
      <AusweisScanModal
        onScan={() => console.log('scanning')}
        onCancel={() => setScanning(false)}
        visible={scanning}
        onComplete={() => {
          setScanning(false);
          onboardingInstance.send(OnboardingMachineEvents.NEXT);
        }}
      />
    </ScreenContainer>
  );
};

export default ImportPersonalDataScreen;
