import React, { FC } from 'react'
import { ColorValue } from 'react-native'
import { connect } from 'react-redux'

import { entities, fonts } from '../../../../styles/colors'
import {
  SSIEntityIconStyled as Avatar,
  SSITextH2LightStyled as AvatarText
} from '../../../../styles/components'
import { RootState } from '../../../../types'
import { getDefaultUserNameInitials } from '../../../../utils/UserUtils'

export interface IProps {
  size?: number
  fontColor?: ColorValue
  bgColor?: ColorValue
  initialsOfUserName: string
}

const SSIEntityIcon: FC<IProps> = (props: IProps): JSX.Element => {
  const { size = 34, fontColor = fonts.light, bgColor = entities['100'], initialsOfUserName = '?' } = props

  return (
    <Avatar
      style={{
        backgroundColor: bgColor,
        width: size
      }}
    >
      <AvatarText style={{ color: fontColor }}>{initialsOfUserName}</AvatarText>
    </Avatar>
  )
}

const mapStateToProps = (state: RootState) => {
  return {
    initialsOfUserName: getDefaultUserNameInitials(state.user.activeUser?.firstName, state.user.activeUser?.lastName)
  }
}

export default connect(mapStateToProps, null)(SSIEntityIcon)
