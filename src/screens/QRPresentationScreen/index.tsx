import {FC} from 'react';
import {Dimensions} from 'react-native';
import {QRContainer, QRPresentationViewContainer, SSIBasicContainerSecondaryStyled as SSIContainer} from '../../styles/components';

import QRCode from '../../components/qrCodes/QRCode';

const {width} = Dimensions.get('screen');

const QRPresentationScreen: FC = () => {
  return (
    <SSIContainer>
      <QRPresentationViewContainer>
        <QRContainer>
          <QRCode
            title={'Presentation'}
            value={'some_uri_content'} // TODO Replace this with some result once back end for holder
            size={(3 * width) / 4}
          />
        </QRContainer>
      </QRPresentationViewContainer>
    </SSIContainer>
  );
};

export default QRPresentationScreen;
