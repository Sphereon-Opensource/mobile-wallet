import {IImageAttributes} from '@sphereon/ssi-sdk.data-store';
import React, {FC} from 'react';
import {ColorValue, View} from 'react-native';
import FastImage from 'react-native-fast-image';

import {translate} from '../../../localization/Localization';
import {backgrounds, credentialCards} from '../../../styles/colors';
import {
  SSIAlphaContainerStyled as AlphaContainer,
  SSIBlurredContainerStyled as BlurredView,
  SSICardViewContainerStyled as Container,
  SSICardViewContentMainContainerStyled as ContentMainContainer,
  SSICardViewContentSubContainerStyled as ContentSubContainer,
  SSICardViewSSICredentialStatusStyled as CredentialStatus,
  SSICardViewCredentialSubtitleTextStyled as CredentialSubtitleText,
  SSICardViewCredentialTitleTextStyled as CredentialTitleText,
  SSITextH5LightStyled as ExpirationDateText,
  SSICardViewFooterContainerStyled as FooterContainer,
  SSICardViewFooterContentContainerStyled as FooterContentContainer,
  SSITextH4LightStyled as H4Text,
  SSICardViewHeaderContainerStyled as HeaderContainer,
  SSICardViewContentIssueNameContainerStyled as IssueNameContainer,
  SSICardViewHeaderLogoContainerStyled as LogoContainer,
  SSICardViewContentPropertiesContainerStyled as PropertiesContainer,
  SSITextH6LightStyled as PropertyValueText,
  SSICardViewHeaderTitleContainerStyled as TitleContainer,
} from '../../../styles/components';
import {CredentialStatusEnum} from '../../../types';
import {toLocalDateString} from '../../../utils/DateUtils';
import {calculateAspectRatio} from '../../../utils/ImageUtils';
import SSIPlaceholderLogo from '../../assets/logos/SSIPlaceholderLogo';

const {v4: uuidv4} = require('uuid');

export interface IProps {
  credentialTitle: string;
  credentialSubtitle?: string;
  credentialStatus?: CredentialStatusEnum;
  issuerName?: string;
  expirationDate?: number;
  properties?: Array<IProperty>;
  backgroundColor?: ColorValue;
  backgroundImage?: IImageAttributes;
  logo?: IImageAttributes;
  textColor?: ColorValue;
}

export interface IProperty {
  name: string;
  value: string;
}

const getPropertyElementsFrom = (properties: Array<IProperty>): Array<JSX.Element> => {
  // We currently only support two properties on the card, this might change in the future
  return properties.slice(0, 2).map((property: IProperty, index: number) => (
    <View
      key={uuidv4()}
      style={{
        ...(properties.length > 1 && {width: 140}),
        ...(index > 0 && {marginLeft: 10}),
      }}>
      <H4Text>{property.name}</H4Text>
      <PropertyValueText>{property.value}</PropertyValueText>
    </View>
  ));
};

const SSICardView: FC<IProps> = (props: IProps): JSX.Element => {
  const {
    credentialTitle,
    credentialSubtitle,
    credentialStatus,
    issuerName,
    expirationDate,
    properties,
    backgroundColor = credentialCards.default,
    logo,
    textColor = backgrounds.primaryLight,
  } = props;

  const uri = props.backgroundImage?.dataUri || props.backgroundImage?.uri;
  const backgroundImage = uri
    ? {uri}
    : {uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='}; // The uri is a transparent pixel in case there is not background image

  return (
    <Container style={{backgroundColor}}>
      <FastImage style={{flex: 1}} source={backgroundImage} resizeMode="cover">
        <AlphaContainer>
          <HeaderContainer>
            <LogoContainer>
              {logo ? (
                <FastImage
                  style={{
                    aspectRatio: logo?.dimensions && calculateAspectRatio(logo?.dimensions.width, logo?.dimensions.height),
                    height: 32,
                  }}
                  source={logo}
                />
              ) : (
                <SSIPlaceholderLogo />
              )}
            </LogoContainer>
            {credentialTitle && (
              <TitleContainer>
                <CredentialTitleText style={{color: textColor}} numberOfLines={2}>
                  {credentialTitle}
                </CredentialTitleText>
                {credentialSubtitle && <CredentialSubtitleText style={{color: textColor}}>{credentialSubtitle}</CredentialSubtitleText>}
              </TitleContainer>
            )}
          </HeaderContainer>
          <ContentMainContainer>
            <ContentSubContainer>
              {issuerName && (
                <IssueNameContainer>
                  <H4Text style={{color: textColor}}>{issuerName}</H4Text>
                </IssueNameContainer>
              )}
              {properties && <PropertiesContainer>{getPropertyElementsFrom(properties)}</PropertiesContainer>}
            </ContentSubContainer>
          </ContentMainContainer>
          <FooterContainer>
            <BlurredView>
              <FooterContentContainer>
                <ExpirationDateText style={{color: textColor}}>
                  {expirationDate
                    ? `${translate('credential_card_expires_message')} ${toLocalDateString(expirationDate)}`
                    : translate('credential_status_never_expires_date_label')}
                </ExpirationDateText>
                {credentialStatus && <CredentialStatus status={credentialStatus} color={textColor} />}
              </FooterContentContainer>
            </BlurredView>
          </FooterContainer>
        </AlphaContainer>
      </FastImage>
    </Container>
  );
};

export default SSICardView;
