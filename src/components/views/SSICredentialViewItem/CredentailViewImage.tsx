import React from 'react';

import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store';
import {
  SSICredentialViewItemBackgroundImageStyled as BackgroundImage,
  SSICredentialViewItemCardStyled as Card,
  SSICredentialViewItemImageContainerStyled as ImageContainer,
  SSICredentialViewItemLogoContainerStyled as LogoContainer,
} from '../../../styles/components';
import {credentialCardColors} from '@sphereon/ui-components.core';
import {SSILogo} from '@sphereon/ui-components.ssi-react-native';

export const CredentialViewImage = ({branding}: {branding?: IBasicCredentialLocaleBranding}) => {
  const CARD_ASPECT_RATIO = 3 / 2;
  const backgroundURI = branding?.background?.image?.uri;
  const backgroundColor = branding?.background?.color ?? credentialCardColors.default;

  return (
    <ImageContainer>
      <Card style={{backgroundColor: backgroundColor, aspectRatio: CARD_ASPECT_RATIO}}>
        {backgroundURI && <BackgroundImage source={{uri: backgroundURI}} resizeMode="cover" />}
        <LogoContainer>
          <SSILogo logo={branding?.logo} color={branding?.text?.color} />
        </LogoContainer>
      </Card>
    </ImageContainer>
  );
};
