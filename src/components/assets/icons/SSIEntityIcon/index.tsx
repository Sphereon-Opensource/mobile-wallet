import React, { FC } from 'react'
import {ColorValue, Text, View} from 'react-native'
import { connect } from 'react-redux'

import { entities, fonts } from '../../../../styles/colors'
import { RootState } from '../../../../types'
import { getGeneralInitialsOfUserName } from '../../../../utils/UserUtils'

export interface IProps {
  size?: number
  fontColor?: ColorValue
  bgColor?: ColorValue
  initialsOfUserName?: string
}

const SSIEntityIcon: FC<IProps> = (props: IProps): JSX.Element => {
  const { size = 34, fontColor = fonts.light, bgColor = entities['100'], initialsOfUserName = '?' } = props

  return (
    <View style={{
      alignItems: 'center',
      aspectRatio: 1,
      backgroundColor: bgColor,
      borderRadius: 17,
      marginTop: 10,
      width: size
    }}>
      <Text  style={{color: fontColor}}>{initialsOfUserName}</Text>
    </View>
  )
}

const mapStateToProps = (state: RootState) => {
  return {
    initialsOfUserName: getGeneralInitialsOfUserName(state.user.activeUser?.firstName, state.user.activeUser?.lastName)
  }
}

export default connect(mapStateToProps, null)(SSIEntityIcon)
