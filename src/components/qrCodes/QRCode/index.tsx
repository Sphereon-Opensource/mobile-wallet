import {FC, ReactElement, useEffect, useState} from 'react';
import {View, ViewStyle} from 'react-native';
import {CreateElementArgs, QRType} from '@sphereon/ssi-sdk.qr-code-generator';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import agent from '../../../agent';

export type Props = {
  value: string; // TODO later we need more support for other values
  title?: string;
  bgColor?: string;
  fgColor?: string;
  size?: number;
  style?: ViewStyle;
};

const QRCode: FC<Props> = (props: Props): ReactElement => {
  const {
    value,
    title,
    bgColor = backgroundColors.primaryLight,
    fgColor = fontColors.dark,
    size,
    style, // TODO add support for this later
  } = props;

  const [QR, setQR] = useState<ReactElement | null>(null);

  useEffect(() => {
    const uriElementArgs: CreateElementArgs<QRType.URI, string> = {
      data: {
        type: QRType.URI,
        object: value,
        //FIXME: determine if the id field should be necessary on a URI
        //element
        id: '',
      },
      renderingProps: {
        level: 'Q',
        bgColor,
        fgColor,
        size,
        title,
      },
    };

    agent.qrURIElement(uriElementArgs).then(QR => setQR(QR));
  }, []);

  // FIXME a little bit dirty return, so we need to handle this better later
  return QR ?? <View />;
};

export default QRCode;
