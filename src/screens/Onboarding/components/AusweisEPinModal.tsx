import {PinInput} from '@pakenfit/react-native-pin-input';
import {Image, View} from 'react-native';
import Modal from 'react-native-modal';
import {SSITextH1RegularStyled, SSITextH3RegularStyled} from '../../../styles/components';
import {ContentContainer, IconContainer, ModalCard} from './styles';

type AusweisEPinModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (pin: string) => void;
};

export const AusweisEPinModal = ({isVisible, onClose, onComplete}: AusweisEPinModalProps) => (
  <Modal
    isVisible={isVisible}
    onBackdropPress={onClose}
    backdropColor="transparent"
    avoidKeyboard
    style={{
      margin: 0,
      justifyContent: 'flex-end',
      padding: 6,
    }}>
    <ModalCard style={{width: '100%'}}>
      <IconContainer>
        <Image
          width={20}
          height={20}
          resizeMode="stretch"
          style={{width: 40, height: 40}}
          source={require('../../../assets/images/ausweis_icon.png')}
        />
      </IconContainer>
      <View style={{alignItems: 'center'}}>
        <SSITextH1RegularStyled style={{color: '#8F8E94'}}>Enter Ausweis eID pin</SSITextH1RegularStyled>
        <SSITextH3RegularStyled>Your pin code is unique to your card</SSITextH3RegularStyled>
      </View>
      <ContentContainer>
        <PinInput
          inputProps={{placeholder: ''}}
          inputStyle={{
            height: 50,
            width: 40,
            fontSize: 16,
          }}
          onFillEnded={onComplete}
          length={6}
          autoFocus
        />
      </ContentContainer>
    </ModalCard>
  </Modal>
);
