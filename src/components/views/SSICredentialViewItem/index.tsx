import React, {FC, useState} from 'react';

import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import {Image} from 'react-native';
import {translate} from '../../../localization/Localization';
import {
  SSICredentialViewItemContainerStyled as Container,
  SSIFlexDirectionRowViewStyled as ContentBottomContainer,
  SSICredentialViewItemContentMiddleContainerStyled as ContentMiddleContainer,
  SSICredentialViewItemDataContainerStyled as DataContainer,
  SSICredentialViewItemExpirationDateCaptionStyled as ExpirationDateCaption,
  SSICredentialViewItemImageContainerStyled as ImageContainer,
  SSITextH5LightStyled as IssueDateCaption,
  SSITextH4LightStyled as IssuerCaption,
  SSICredentialViewItemRowStyled as Row,
  SSICredentialViewItemContentTopContainerStyled as ContentTopContainer,
  SSICredentialViewItemTitleCaptionStyled as TitleCaption,
  SSICredentialViewItemStatusContainerStyled as CredentialStatusContainer,
  SSICredentialViewItemBackgroundImageStyled as BackgroundImage,
  SSICredentialViewItemCardStyled as Card,
  SSICredentialViewItemLogoContainerStyled as LogoContainer,
  SSICredentialViewItemLogoImageStyled as LogoImage,
} from '../../../styles/components';
import {toLocalDateString, toLocalDateTimeString} from '../../../utils';
import {SSIStatusLabel} from '@sphereon/ui-components.ssi-react-native';

// TODO fix to many properties
export interface Props extends CredentialSummary {
  // TODO should only contain info this screen needs, ICredentialSummary is to much
  showTime?: boolean;
}

const CredentialViewImage: React.FC<{branding: IBasicCredentialLocaleBranding}> = ({branding}) => {
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

const SSICredentialViewItem: FC<Props> = (props: Props): JSX.Element => {
  const {branding, credentialStatus, expirationDate, issueDate, issuer, showTime = false, title} = props;
  return (
    <Container>
      <Row>
        {branding && <CredentialViewImage branding={branding} />}
        <DataContainer>
          <ContentTopContainer>
            <TitleCaption numberOfLines={2}>{title}</TitleCaption>
            <CredentialStatusContainer>
              <SSIStatusLabel status={credentialStatus} />
            </CredentialStatusContainer>
          </ContentTopContainer>
          <ContentMiddleContainer>
            <IssuerCaption>{issuer.alias}</IssuerCaption>
          </ContentMiddleContainer>
          <ContentBottomContainer>
            <IssueDateCaption>{showTime ? toLocalDateTimeString(issueDate) : toLocalDateString(issueDate)}</IssueDateCaption>
            <ExpirationDateCaption>
              {expirationDate
                ? `${translate('credentials_view_item_expires_on')} ${
                    showTime ? toLocalDateTimeString(expirationDate) : toLocalDateString(expirationDate)
                  }`
                : translate('credential_status_never_expires_date_label')}
            </ExpirationDateCaption>
          </ContentBottomContainer>
        </DataContainer>
      </Row>
    </Container>
  );
};

export default SSICredentialViewItem;
