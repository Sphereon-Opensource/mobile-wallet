import {FC, useEffect, useState} from 'react';
import {Dimensions} from 'react-native';
import {SSIBasicContainerSecondaryStyled as SSIContainer} from '../../styles/components';
import {QRContainer, QRPresentationViewContainer} from 'src/styles/components/screens/QRPresentationScreen';
import {CreateElementArgs, QRType} from '@sphereon/ssi-sdk.qr-code-generator';
import {agentContext} from '../../agent';

const {width} = Dimensions.get('screen');

type QRPresentationScreenProps = {};

const QRPresentationScreen: FC<QRPresentationScreenProps> = (props: QRPresentationScreenProps) => {
  const [qrElement, setQrElement] = useState<React.ReactElement | null>(null);
  const delegate = async () => {
    const uriElementArgs: CreateElementArgs<QRType.URI, string> = {
      data: {
        type: QRType.URI,
        object: 'something',
        id: 'something',
      },
      renderingProps: {
        bgColor: 'white',
        fgColor: '#352575',
        level: 'Q',
        size: (3 * width) / 4,
        title: 'Presentation',
      },
    };

    setQrElement(await agentContext.agent.qrURIElement(uriElementArgs));
  };

  useEffect(() => {
    delegate();
  }, []);

  return (
    <SSIContainer>
      <QRPresentationViewContainer>
        <QRContainer>{qrElement}</QRContainer>
      </QRPresentationViewContainer>
    </SSIContainer>
  );
};

export default QRPresentationScreen;
