import { Avatar } from '@rneui/themed'
import React, { FC } from 'react'
import { ColorValue, View } from 'react-native'
import { connect } from 'react-redux'

import { entities, fonts } from '../../../../styles/colors'
import { RootState } from '../../../../types'
import { getGeneralInitialsOfUserName } from '../../../../utils/UserUtils'

export interface IProps {
  size?: number
  fontColour?: ColorValue
  backgroundColor?: ColorValue
  initialsOfUserName?: string
}

const SSIEntityIcon: FC<IProps> = (props: IProps): JSX.Element => {
  const { size = 34, fontColour = fonts.light, backgroundColor = entities['100'], initialsOfUserName = '?' } = props

  return (
    <View style={{ width: size, aspectRatio: 1 }}>
      <Avatar
        size={size}
        rounded
        title={initialsOfUserName}
        titleStyle={{ color: fontColour }}
        icon={{ name: 'rowing' }}
        containerStyle={{ backgroundColor: backgroundColor }}
      />
    </View>
  )
}

const mapStateToProps = (state: RootState) => {
  return {
    initialsOfUserName: getGeneralInitialsOfUserName(state.user.activeUser?.firstName, state.user.activeUser?.lastName)
  }
}

export default connect(mapStateToProps, null)(SSIEntityIcon)
