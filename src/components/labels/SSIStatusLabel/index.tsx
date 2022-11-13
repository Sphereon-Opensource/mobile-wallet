import React, { FC } from 'react'
import { View, ViewStyle } from 'react-native'

import { ConnectionStatusEnum, CredentialStatusEnum, IssuerStatusEnum, LabelStatus } from '../../../@types'
import { translate } from '../../../localization/Localization'
import { Statuses } from '../../../styles/colors'
import {
  SSIStatusLabelBadgeContainer as BadgeContainer,
  SSIStatusLabelContainerStyled as Container,
  SSIStatusLabelStatusCaptionStyled as StatusCaption
} from '../../../styles/components'
import SSICheckmarkBadge from '../../badges/SSICheckmarkBadge'
import SSIExclamationMarkBadge from '../../badges/SSIExclamationMarkBadge'

export interface IProps {
  status: LabelStatus
  showIcon?: boolean
  color?: string
  style?: ViewStyle
}

const SSIStatusLabel: FC<IProps> = (props: IProps): JSX.Element => {
  const { status, color = Statuses[status], style, showIcon = false } = props

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
      return 'Verified' // TODO
    case IssuerStatusEnum.UNVERIFIED:
      return 'Unverified' // TODO
    case CredentialStatusEnum.VALID:
      return translate('credential_status_valid')
    case CredentialStatusEnum.EXPIRED:
      return translate('credential_status_expired')
    case CredentialStatusEnum.REVOKED:
      return translate('credential_status_revoked')
    case ConnectionStatusEnum.CONNECTED:
      return translate('connection_status_connected')
    case ConnectionStatusEnum.DISCONNECTED:
      return translate('connection_status_disconnected')
    default:
      return 'Unknown' // TODO
  }
}

const getStatusBadge = (status: LabelStatus, backgroundColor?: string): JSX.Element => {
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
      return <View /> // TODO
    case ConnectionStatusEnum.CONNECTED:
      return <SSICheckmarkBadge backgroundColor={backgroundColor} />
    case ConnectionStatusEnum.DISCONNECTED:
      return <SSIExclamationMarkBadge backgroundColor={backgroundColor} />
    default:
      return <View />
  }
}

export default SSIStatusLabel
