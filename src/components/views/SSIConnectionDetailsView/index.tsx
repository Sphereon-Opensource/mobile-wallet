import React, { FC } from 'react'
import { ListRenderItemInfo } from 'react-native'

import { DETAILS_INITIAL_NUMBER_TO_RENDER } from '../../../@config/constants'
import { translate } from '../../../localization/Localization'
import {
  SSIFlexDirectionColumnHalfViewStyled as Column,
  SSIConnectionDetailsViewRoundedContainerStyled as Container,
  SSIConnectionDetailsLabelsContainerStyled as DetailLabelsContainer,
  SSIConnectionDetailsViewCaptionDetailsStyled as DetailsCaption,
  SSITextH5LightStyled as DetailsItemLabelCaption,
  SSIConnectionDetailsViewValueCaptionStyled as DetailsItemValueCaption,
  SSIDetailsViewDetailsListStyled as DetailsList,
  SSIConnectionDetailsViewLabelRowViewStyled as LabelRow,
  SSIConnectionDetailsViewSeparatorStyled as Separator
} from '../../../styles/components'
import { IConnectionViewItem } from '../../../types'
import SSIConnectionViewItem from '../SSIConnectionViewItem'

export interface IProps {
  entityConnection: IConnectionViewItem
}

// TODO interface should be replaced by proper interface for connection details
export interface IDetails {
  id: string
  label: string
  value: string
}

const SSIConnectionDetailsView: FC<IProps> = (props: IProps): JSX.Element => {
  const renderItem = (itemInfo: ListRenderItemInfo<IDetails>) => {
    return (
      <LabelRow>
        <Column>
          <DetailsItemLabelCaption>{itemInfo.item.label}</DetailsItemLabelCaption>
        </Column>
        <Column>
          <DetailsItemValueCaption>{itemInfo.item.value}</DetailsItemValueCaption>
        </Column>
      </LabelRow>
    )
  }

  return (
    <Container>
      <SSIConnectionViewItem
        name={props.entityConnection.entityName}
        // TODO we need a connection uri which currently is not available
        uri={props.entityConnection.connection.config.redirectUrl}
      />
      <Separator />
      <DetailLabelsContainer>
        <DetailsCaption>{translate('connection_details_view_details')}</DetailsCaption>
        <DetailsList
          // TODO has a ItemSeparatorComponent which is a bit nicer to use then the logic now with margins
          data={props.entityConnection.connection.metadata}
          renderItem={renderItem}
          keyExtractor={(item: IDetails) => item.id}
          initialNumToRender={DETAILS_INITIAL_NUMBER_TO_RENDER}
          removeClippedSubviews
        />
      </DetailLabelsContainer>
    </Container>
  )
}

export default SSIConnectionDetailsView
