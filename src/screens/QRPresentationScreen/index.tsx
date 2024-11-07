import {FC} from 'react';
import {SSIBasicContainerSecondaryStyled as SSIContainer} from '../../styles/components';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {QRPlaceholderView, QRPlaceholderViewContainer} from 'src/styles/components/screens/QRPresentationScreen';

type QRPresentationScreenProps = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.QR_PRESENTATION>;

const QRPresentationScreen: FC<QRPresentationScreenProps> = (props: QRPresentationScreenProps) => {
  return (
    <SSIContainer>
      <QRPlaceholderViewContainer>
        <QRPlaceholderView />
      </QRPlaceholderViewContainer>
    </SSIContainer>
  );
};
