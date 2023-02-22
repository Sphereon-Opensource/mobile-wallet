import React, { FC } from 'react'
import { ColorValue, View, ViewStyle } from 'react-native'

import { translate } from '../../../localization/Localization'
import { statuses } from '../../../styles/colors'
import {
  SSIStatusLabelBadgeContainer as BadgeContainer,
  SSIStatusLabelContainerStyled as Container,
  SSIStatusLabelStatusCaptionStyled as StatusCaption
} from '../../../styles/components'
import { ConnectionStatusEnum, CredentialStatusEnum, IssuerStatusEnum, LabelStatus } from '../../../types'
import SSICheckmarkBadge from '../../assets/badges/SSICheckmarkBadge'
import SSIExclamationMarkBadge from '../../assets/badges/SSIExclamationMarkBadge'

export interface IProps {
  status: LabelStatus
  showIcon?: boolean
  color?: ColorValue
  style?: ViewStyle
}

const SSIStatusLabel: FC<IProps> = (props: IProps): JSX.Element => {
  const { status, color = statuses[status], style, showIcon = false } = props

  return (
    <Container style={[style, { borderColor: color }]}>
      {showIcon && <BadgeContainer>{getStatusBadge(status, color)}</BadgeContainer>}
      <StatusCaption style={{ color }}>{getStatusTranslation(status)}</StatusCaption>
    </Container>
  )
}

const getStatusTranslation = (status: LabelStatus): string => {
  switch (status) {
    case IssuerStatusEnum.VERIFIED:
      return translate('issuer_status_verified')
    case IssuerStatusEnum.UNVERIFIED:
      return translate('issuer_status_unverified')
    case CredentialStatusEnum.VALID:
      return translate('credential_status_valid')
    case CredentialStatusEnum.EXPIRED:
      return translate('credential_status_expired')
    case CredentialStatusEnum.REVOKED:
      return translate('credential_status_revoked')
    case CredentialStatusEnum.NEVER_EXPIRES:
      return translate('credential_status_never_expires')
    case ConnectionStatusEnum.CONNECTED:
      return translate('connection_status_connected')
    case ConnectionStatusEnum.DISCONNECTED:
      return translate('connection_status_disconnected')
    default:
      return translate('status_missing')
  }
}

const getStatusBadge = (status: LabelStatus, backgroundColor?: ColorValue): JSX.Element => {
  switch (status) {
    case IssuerStatusEnum.VERIFIED:
      return <SSICheckmarkBadge backgroundColor={backgroundColor} />
    case IssuerStatusEnum.UNVERIFIED:
      return <SSIExclamationMarkBadge backgroundColor={backgroundColor} />
    case CredentialStatusEnum.VALID:
      return <SSICheckmarkBadge backgroundColor={backgroundColor} />
    case CredentialStatusEnum.EXPIRED:
      return <SSIExclamationMarkBadge backgroundColor={backgroundColor} />
    case CredentialStatusEnum.REVOKED:
      return <View /> // TODO we are missing this in the design
    case ConnectionStatusEnum.CONNECTED:
      return <SSICheckmarkBadge backgroundColor={backgroundColor} />
    case ConnectionStatusEnum.DISCONNECTED:
      return <SSIExclamationMarkBadge backgroundColor={backgroundColor} />
    default:
      return <View />
  }
}

export default SSIStatusLabel
