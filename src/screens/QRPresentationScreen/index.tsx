import {FC, useEffect, useState, ReactElement} from 'react';
import {Dimensions} from 'react-native';
import {SSIBasicContainerSecondaryStyled as SSIContainer} from '../../styles/components';
import {QRContainer, QRPresentationViewContainer} from 'src/styles/components/screens/QRPresentationScreen';
import {CreateElementArgs, QRType} from '@sphereon/ssi-sdk.qr-code-generator';
import {agentContext} from '../../agent';

const {width} = Dimensions.get('screen');

/* FIXME: Replace this with some result once back end for holder
 * presentations is complete.
 */
const mockURI = 'some_uri_content';

const QRPresentationScreen: FC = () => {
  const [qrElement, setQrElement] = useState<ReactElement | null>(null);
  const delegate = async () => {
    const uriElementArgs: CreateElementArgs<QRType.URI, string> = {
      data: {
        type: QRType.URI,
        object: mockURI,
        //FIXME: determine if the id field should be necessary on a URI
        //element
        id: '',
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
    void delegate();
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
