import React, {FC} from 'react';

import {translate} from '../../../localization/Localization';
import {
  SSICredentialViewItemContainerStyled as Container,
  SSIFlexDirectionRowViewStyled as ContentBottomContainer,
  SSICredentialViewItemContentMiddleContainerStyled as ContentMiddleContainer,
  SSICredentialViewItemContentTopContainerStyled as ContentTopContainer,
  SSICredentialViewItemStatusContainerStyled as CredentialStatusContainer,
  SSICredentialViewItemExpirationDateCaptionStyled as ExpirationDateCaption,
  SSITextH5LightStyled as IssueDateCaption,
  SSITextH4LightStyled as IssuerCaption,
  SSICredentialViewItemTitleCaptionStyled as TitleCaption,
} from '../../../styles/components';
import {ICredentialSummary} from '../../../types';
import {toLocalDateString, toLocalDateTimeString} from '../../../utils/DateUtils';
import SSIStatusLabel from '../../labels/SSIStatusLabel';

// TODO fix to many properties
export interface Props extends ICredentialSummary {
  // TODO should only contain info this screen needs, ICredentialSummary is to much
  showTime?: boolean;
}

const SSICredentialViewItem: FC<Props> = (props: Props): JSX.Element => {
  const {branding, credentialStatus, expirationDate, issueDate, issuer, showTime = false, title} = props;
  return (
    <Container>
      <ContentTopContainer>
        <TitleCaption numberOfLines={2}>{branding?.alias || title}</TitleCaption>
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
    </Container>
  );
};

export default SSICredentialViewItem;
