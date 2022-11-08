import React, { FC } from 'react'
import { ViewStyle } from 'react-native'

import { CredentialStatusEnum } from '../../../@types'
import { translate } from '../../../localization/Localization'
import { credentialStatuses } from '../../../styles/colors'
import { SSICredentialStatusContainerStyled as Container } from '../../../styles/components'
import { SSITextH5LightStyled as CredentialStatusCaption } from '../../../styles/styledComponents'

export interface IProps {
  status: CredentialStatusEnum
  color?: string
  style?: ViewStyle
}

const SSICredentialStatus: FC<IProps> = (props: IProps): JSX.Element => {
  const { status, color, style } = props

  return (
    <Container style={[style, { borderColor: color ? color : credentialStatuses[status] }]}>
      <CredentialStatusCaption style={{ color: color ? color : credentialStatuses[status] }}>
        {getStatusTranslation(status)}
      </CredentialStatusCaption>
    </Container>
  )
}

const getStatusTranslation = (status: CredentialStatusEnum): string => {
  switch (status) {
    case CredentialStatusEnum.VALID:
      return translate('credential_status_valid')
    case CredentialStatusEnum.EXPIRED:
      return translate('credential_status_expired')
    case CredentialStatusEnum.REVOKED:
      return translate('credential_status_revoked')
    default:
      return translate('credential_status_missing_status')
  }
}

export default SSICredentialStatus
