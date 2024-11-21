import React, {useState} from 'react';

import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store';
import {Image} from 'react-native';
import {
  SSICredentialViewItemBackgroundImageStyled as BackgroundImage,
  SSICredentialViewItemCardStyled as Card,
  SSICredentialViewItemImageContainerStyled as ImageContainer,
  SSICredentialViewItemLogoContainerStyled as LogoContainer,
  SSICredentialViewItemLogoImageStyled as LogoImage,
} from '../../../styles/components';

export const CredentialViewImage = ({branding}: {branding: IBasicCredentialLocaleBranding}) => {
  const CARD_ASPECT_RATIO = 3 / 2;
  const backgroundURI = branding.background?.image?.uri;
  const backgroundColor = branding.background?.color ? branding.background.color : 'white';
  const logoURI = branding.logo?.uri;
  const [logoAspectRatio, setLogoAspectRatio] = useState(1);

  if (logoURI) {
    Image.getSize(logoURI, (width, height) => height && setLogoAspectRatio(width / height));
  }

  return (
    <ImageContainer>
      <Card style={{backgroundColor: backgroundColor, aspectRatio: CARD_ASPECT_RATIO}}>
        {backgroundURI && <BackgroundImage source={{uri: backgroundURI}} resizeMode="cover" />}
        {logoURI && (
          <LogoContainer>
            <LogoImage source={{uri: logoURI}} style={{aspectRatio: logoAspectRatio}} />
          </LogoContainer>
        )}
      </Card>
    </ImageContainer>
  );
};
