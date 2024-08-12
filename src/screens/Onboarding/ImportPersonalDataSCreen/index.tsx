import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {ScreenRoutesEnum, StackParamList} from '../../../types';
import {translate} from '../../../localization/Localization';
import {Dimensions, Image, Keyboard} from 'react-native';
import {useCallback, useState} from 'react';
import {Container, Title, TitleContainer, Text, ContentContainer, ButtonContainer} from '../components/styles';
import {AusweisEPinModal} from '../components/AusweisEPinModal';
import {AusweisScanModal} from '../components/AusweisScanModal';

const {width} = Dimensions.get('window');

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.IMPORT_DATA>;

const ImportPersonalDataScreen = (props: Props) => {
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
      <ButtonContainer>
        <PrimaryButton
          style={{height: 42, width: 300}}
          caption="Next"
          backgroundColors={['#7276F7', '#7C40E8']}
          captionColor={fontColors.light}
          onPress={() => transition()}
        />
      </ButtonContainer>
      <AusweisEPinModal focusOnMount visible={showPin} onComplete={onCompletePin} />
      <AusweisScanModal
        onScan={() => console.log('scanning')}
        onCancel={() => setScanning(false)}
        visible={scanning}
        onComplete={() => setScanning(false)}
      />
    </Container>
  );
};

export default ImportPersonalDataScreen;
