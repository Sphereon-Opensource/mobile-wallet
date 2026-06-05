import React from 'react';

import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store-types';
import {Text, View} from 'react-native';
import {
  SSICredentialViewItemBackgroundImageStyled as BackgroundImage,
  SSICredentialViewItemCardStyled as Card,
  SSICredentialViewItemImageContainerStyled as ImageContainer,
  SSICredentialViewItemLogoContainerStyled as LogoContainer,
} from '../../../styles/components';
import {CredentialStatus, credentialCardColors, getStatusTranslation, statusColors} from '@sphereon/ui-components.core';
import {SSILogo} from '@sphereon/ui-components.ssi-react-native';

export const CredentialViewImage = ({
  branding,
  credentialStatus,
}: {
  branding?: IBasicCredentialLocaleBranding;
  credentialStatus?: CredentialStatus;
}) => {
  const CARD_ASPECT_RATIO = 3 / 2;
  const backgroundURI = branding?.background?.image?.uri;
  const backgroundColor = branding?.background?.color ?? credentialCardColors.default;
  // Full-width status ribbon for revoked/expired — the mini-card is too small for a centered tab.
  const ribbonColor =
    credentialStatus === CredentialStatus.REVOKED
      ? statusColors.revoked
      : credentialStatus === CredentialStatus.EXPIRED
      ? statusColors.expired
      : undefined;

  return (
    <ImageContainer>
      <Card style={{backgroundColor: backgroundColor, aspectRatio: CARD_ASPECT_RATIO}}>
        {backgroundURI && <BackgroundImage source={{uri: backgroundURI}} resizeMode="cover" />}
        <LogoContainer>
          <SSILogo logo={branding?.logo} color={branding?.text?.color} />
        </LogoContainer>
        {ribbonColor && credentialStatus && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              backgroundColor: ribbonColor,
              alignItems: 'center',
              paddingVertical: 1.5,
              zIndex: 5,
            }}>
            <Text style={{color: '#FFFFFF', fontSize: 7, fontWeight: '700', letterSpacing: 0.3}}>
              {getStatusTranslation(credentialStatus).toUpperCase()}
            </Text>
          </View>
        )}
      </Card>
    </ImageContainer>
  );
};
