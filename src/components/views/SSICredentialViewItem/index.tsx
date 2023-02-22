import React, { FC } from 'react'

import { translate } from '../../../localization/Localization'
import {
  SSICredentialViewItemContainerStyled as Container,
  SSIFlexDirectionRowViewStyled as ContentBottomContainer,
  SSICredentialViewItemContentMiddleContainerStyled as ContentMiddleContainer,
  SSICredentialViewItemContentTopContainerStyled as ContentTopContainer,
  SSICredentialViewItemStatusCaptionStyled as CredentialStatusCaption,
  SSICredentialViewItemExpirationDateCaptionStyled as ExpirationDateCaption,
  SSITextH5LightStyled as IssueDateCaption,
  SSITextH4LightStyled as IssuerCaption,
  SSITextH3LightStyled as TitleCaption
} from '../../../styles/components'
import { ICredentialSummary } from '../../../types'
import { toLocalDateString, toLocalDateTimeString } from '../../../utils/DateUtils'
import SSIStatusLabel from '../../labels/SSIStatusLabel'

// TODO fix to many properties
export interface Props extends ICredentialSummary {
  // TODO should only contain info this screen needs, ICredentialSummary is to much
  showTime?: boolean
}

const SSICredentialViewItem: FC<Props> = (props: Props): JSX.Element => {
  const { showTime = false } = props

  return (
    <Container>
      <ContentTopContainer>
        <TitleCaption>{props.title}</TitleCaption>
        <CredentialStatusCaption>
          <SSIStatusLabel status={props.credentialStatus} />
        </CredentialStatusCaption>
      </ContentTopContainer>
      <ContentMiddleContainer>
        <IssuerCaption>
          {typeof props.issuer === 'string'
            ? props.issuer.length <= 50
              ? props.issuer
              : `${props.issuer.substring(0, 50)}...`
            : props.issuer.name}
        </IssuerCaption>
      </ContentMiddleContainer>
      <ContentBottomContainer>
        <IssueDateCaption>
          {showTime ? toLocalDateTimeString(props.issueDate) : toLocalDateString(props.issueDate)}
        </IssueDateCaption>
        <ExpirationDateCaption>
          {props.expirationDate
            ? `${translate('credentials_view_item_expires_on')} ${
                showTime ? toLocalDateTimeString(props.expirationDate) : toLocalDateString(props.expirationDate)
              }`
            : translate('credential_status_never_expires_date_label')}
        </ExpirationDateCaption>
      </ContentBottomContainer>
    </Container>
  )
}

export default SSICredentialViewItem
