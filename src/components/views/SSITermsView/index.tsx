import React, { FC } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent, Text } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { SSIBasicContainerStyled as RouteContainer } from '../../../styles/components'

export interface IProps {
  content: string
  onScrollBottom?: () => Promise<void>
}

const SSITermsView: FC<IProps> = (props: IProps): JSX.Element => {
  const { content, onScrollBottom } = props

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    const paddingToBottom = 18 // TODO refactor magic number
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
  }

  const onScroll = async ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isCloseToBottom(nativeEvent)) {
      if (onScrollBottom) {
        await onScrollBottom()
      }
    }
  }

  return ( // TODO move color
    <RouteContainer style={{ backgroundColor: '#202537' }}>
      <ScrollView style={{ marginLeft: 24, marginRight: 24, marginTop: 16 }} onScroll={onScroll}>
        <Text style={{ color: 'white', marginBottom: 18 }}>{content}</Text>
      </ScrollView>
    </RouteContainer>
  )
}

export default SSITermsView
