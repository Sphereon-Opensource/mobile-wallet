import React, { FC } from 'react'
import { ColorValue, Text } from 'react-native'
import { connect } from 'react-redux'

import { entities, fonts } from '../../../../styles/colors'
import { SSIEntityIconStyled as Avatar } from '../../../../styles/components'
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
    <Avatar
      style={{
        marginTop: 5,
        backgroundColor: bgColor,
        width: size
      }}
    >
      <Text style={{ color: fontColor }}>{initialsOfUserName}</Text>
    </Avatar>
  )
}

const mapStateToProps = (state: RootState) => {
  return {
    initialsOfUserName: getGeneralInitialsOfUserName(state.user.activeUser?.firstName, state.user.activeUser?.lastName)
  }
}

export default connect(mapStateToProps, null)(SSIEntityIcon)
