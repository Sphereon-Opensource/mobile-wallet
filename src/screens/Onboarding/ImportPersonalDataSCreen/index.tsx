import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useCallback, useContext, useState} from 'react';
import {Image, Keyboard} from 'react-native';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {AusweisEPinModal} from '../components/AusweisEPinModal';
import {AusweisScanModal} from '../components/AusweisScanModal';
import {Container, ContentContainer, Text, Title, TitleContainer} from '../components/styles';

const ImportPersonalDataScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [scanning, setScanning] = useState(false);

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

  return (
    <Container>
      <TitleContainer>
        <Title>{translate('scan_card_step_title')}</Title>
        <Text>{translate('scan_card_step_subtitle')}</Text>
      </TitleContainer>
      <ContentContainer
        onPress={() => {
          setShowPin(false);
          Keyboard.dismiss();
        }}>
        <Image source={require('../../../assets/images/scan_card.png')} height={200} width={100} style={{height: 300, width: 200}} />
      </ContentContainer>
      <PrimaryButton
        style={{height: 42, width: 300}}
        caption="Next"
        backgroundColors={['#7276F7', '#7C40E8']}
        captionColor={fontColors.light}
        onPress={() => transition()}
      />
      <AusweisEPinModal focusOnMount visible={showPin} onComplete={onCompletePin} />
      <AusweisScanModal
        onScan={() => console.log('scanning')}
        onCancel={() => setScanning(false)}
        visible={scanning}
        onComplete={() => {
          setScanning(false);
          onboardingInstance.send(OnboardingMachineEvents.NEXT);
        }}
      />
    </Container>
  );
};

export default ImportPersonalDataScreen;
