import React, { FC } from 'react'
import { ViewStyle } from 'react-native'

import { ConnectionStatusEnum } from '../../../@types'
import { translate } from '../../../localization/Localization'
import { connectionStatuses } from '../../../styles/colors'
import { SSITextH4LightStyled as ConnectionStatusCaption } from '../../../styles/styledComponents'

export interface IProps {
  status: ConnectionStatusEnum
  style?: ViewStyle
}

const SSIConnectionStatus: FC<IProps> = (props: IProps): JSX.Element => {
  return (
    <ConnectionStatusCaption style={[props.style, { color: connectionStatuses[props.status] }]}>
      {getStatusTranslation(props.status)}
    </ConnectionStatusCaption>
  )
}

const getStatusTranslation = (status: ConnectionStatusEnum): string => {
  switch (status) {
    case ConnectionStatusEnum.CONNECTED:
      return translate('connection_status_connected')
    case ConnectionStatusEnum.DISCONNECTED:
      return translate('connection_status_disconnected')
    default:
      return translate('connection_status_missing_status')
  }
}

export default SSIConnectionStatus
