import React, { FC } from 'react'
import { View } from 'react-native'

import { IConnectionViewItem } from '../../../@types'
import {
  SSICredentialViewItemStatusCaptionStyled as ConnectionStatusCaption,
  SSITextH4LightStyled as ConnectionTypeCaption,
  SSIFlexDirectionRowViewStyled as ContentBottomContainer,
  SSICredentialViewItemContentMiddleContainerStyled as ContentMiddleContainer,
  SSICredentialViewItemContentTopContainerStyled as ContentTopContainer,
  SSITextH5LightStyled as CreatedDateCaption,
  SSITextH3LightStyled as ProviderCaption
} from '../../../styles/styledComponents'
import DateUtils from '../../../utils/DateUtils'
import SSIStatusLabel from '../../labels/SSIStatusLabel'

export interface IProps extends IConnectionViewItem {
  showTime?: boolean
}

const SSIConnectionsViewItem: FC<IProps> = (props: IProps): JSX.Element => {
  // default values only
  const { showTime = false } = props

  return (
    <View>
      <ContentTopContainer>
        <ProviderCaption>{props.entityName}</ProviderCaption>
        <ConnectionStatusCaption>
          <SSIStatusLabel status={props.connectionStatus} />
        </ConnectionStatusCaption>
      </ContentTopContainer>
      <ContentMiddleContainer>
        <ConnectionTypeCaption>{props.connection.type}</ConnectionTypeCaption>
      </ContentMiddleContainer>
      <ContentBottomContainer>
        {props.connection.createdAt && (
          <CreatedDateCaption>
            {showTime
              ? DateUtils.toLocalDateTimeString(props.connection.createdAt.getTime() / 1000)
              : DateUtils.toLocalDateString(props.connection.createdAt.getTime() / 1000)}
          </CreatedDateCaption>
        )}
      </ContentBottomContainer>
    </View>
  )
}

export default SSIConnectionsViewItem
