import React, {FC} from 'react';

import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import {SSIStatusLabel} from '@sphereon/ui-components.ssi-react-native';
import {translate} from '../../../localization/Localization';
import {
  SSICredentialViewItemContainerStyled as Container,
  SSIFlexDirectionRowViewStyled as ContentBottomContainer,
  SSICredentialViewItemContentMiddleContainerStyled as ContentMiddleContainer,
  SSICredentialViewItemContentTopContainerStyled as ContentTopContainer,
  SSICredentialViewItemStatusContainerStyled as CredentialStatusContainer,
  SSICredentialViewItemDataContainerStyled as DataContainer,
  SSICredentialViewItemExpirationDateCaptionStyled as ExpirationDateCaption,
  SSITextH5LightStyled as IssueDateCaption,
  SSITextH4LightStyled as IssuerCaption,
  SSICredentialViewItemRowStyled as Row,
  SSICredentialViewItemTitleCaptionStyled as TitleCaption,
} from '../../../styles/components';
import {toLocalDateString, toLocalDateTimeString} from '../../../utils';
import {CredentialViewImage} from './CredentailViewImage';

// TODO fix to many properties
export interface Props extends CredentialSummary {
  // TODO should only contain info this screen needs, ICredentialSummary is to much
  showTime?: boolean;
}

const SSICredentialViewItem: FC<Props> = (props: Props): JSX.Element => {
  const {branding, credentialStatus, expirationDate, issueDate, issuer, showTime = false, title} = props;
  return (
    <Container>
      <Row>
        <CredentialViewImage branding={branding} />
        <DataContainer>
          <ContentTopContainer>
            <TitleCaption numberOfLines={2}>{title}</TitleCaption>
            <CredentialStatusContainer>
              <SSIStatusLabel status={credentialStatus} />
            </CredentialStatusContainer>
          </ContentTopContainer>
          <ContentMiddleContainer>
            <IssuerCaption>{issuer.alias ?? issuer.name}</IssuerCaption>
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
