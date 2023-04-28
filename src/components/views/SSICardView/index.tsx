import React, {FC} from 'react';
import {ColorValue, Image, ImageBackground, View, ViewStyle} from 'react-native';

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
import SSIPlaceholderLogo from '../../assets/logos/SSIPlaceholderLogo';

const {v4: uuidv4} = require('uuid');

export interface IProps {
  backgroundColor?: ColorValue;
  backgroundImage?: string; // TODO WAL-302 Support passing in storage location
  logoImage?: string; // TODO WAL-302 Support passing in storage location
  credentialTitle: string;
  credentialSubtitle?: string;
  credentialStatus?: CredentialStatusEnum;
  issuerName?: string;
  expirationDate?: number;
  properties?: Array<IProperty>;
  style?: ViewStyle;
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
    backgroundColor = credentialCards.default,
    credentialTitle,
    credentialSubtitle,
    credentialStatus,
    issuerName,
    expirationDate,
    properties,
    style,
  } = props;

  // The uri is a transparent pixel in case there is not background image
  const backgroundImage = props.backgroundImage
    ? {uri: props.backgroundImage}
    : {uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='};
  const logoImage = props.logoImage ? {uri: props.logoImage} : null;

  return (
    <Container style={[style, {backgroundColor}]}>
      <ImageBackground style={{flex: 1}} source={backgroundImage} resizeMode="cover">
        <AlphaContainer>
          <HeaderContainer>
            <LogoContainer>{logoImage ? <Image style={{flex: 1}} source={logoImage} resizeMode="contain" /> : <SSIPlaceholderLogo />}</LogoContainer>
            {credentialTitle && (
              <TitleContainer>
                <CredentialTitleText numberOfLines={2}>{credentialTitle}</CredentialTitleText>
                {credentialSubtitle && <CredentialSubtitleText>{credentialSubtitle}</CredentialSubtitleText>}
              </TitleContainer>
            )}
          </HeaderContainer>
          <ContentMainContainer>
            <ContentSubContainer>
              {issuerName && (
                <IssueNameContainer>
                  <H4Text>{issuerName}</H4Text>
                </IssueNameContainer>
              )}
              {properties && <PropertiesContainer>{getPropertyElementsFrom(properties)}</PropertiesContainer>}
            </ContentSubContainer>
          </ContentMainContainer>
          <FooterContainer>
            <BlurredView>
              <FooterContentContainer>
                <ExpirationDateText>
                  {expirationDate
                    ? `${translate('credential_card_expires_message')} ${toLocalDateString(expirationDate)}`
                    : translate('credential_status_never_expires_date_label')}
                </ExpirationDateText>
                {credentialStatus && <CredentialStatus status={credentialStatus} color={backgrounds.primaryLight} />}
              </FooterContentContainer>
            </BlurredView>
          </FooterContainer>
        </AlphaContainer>
      </ImageBackground>
    </Container>
  );
};

export default SSICardView;
