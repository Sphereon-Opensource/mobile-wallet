import React, {FC} from 'react';
import {ColorValue, ViewStyle} from 'react-native';

import {credentialCards} from '../../../../styles/colors';
import {
  SSICredentialLogoImageStyled as BackgroundImage,
  SSICredentialLogoContainerStyled as Container,
  SSICredentialLogoPlaceholderImageStyled as PlaceholderImage,
} from '../../../../styles/components';

export interface IProps {
  backgroundColor?: ColorValue;
  image?: string; // TODO WAL-302 Support passing in storage location
  style?: ViewStyle;
}

const SSICredentialLogo: FC<IProps> = (props: IProps): JSX.Element => {
  const {image, style, backgroundColor = credentialCards.default} = props;
  const backgroundImage = image ? {uri: image} : {};

  return (
    <Container style={[style, {backgroundColor}]}>
      <BackgroundImage source={backgroundImage}>{!image && <PlaceholderImage />}</BackgroundImage>
    </Container>
  );
};

export default SSICredentialLogo;
