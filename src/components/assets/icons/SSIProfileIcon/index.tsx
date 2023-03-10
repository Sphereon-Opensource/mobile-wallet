import React, { FC } from 'react'
import { ColorValue } from 'react-native'
import { connect } from 'react-redux'

import { entities, fonts } from '../../../../styles/colors'
import {
  SSIEntityIconStyled as ProfileIconBackground,
  SSITextH4LightStyled as ProfileIconText
} from '../../../../styles/components'
import {IUser, RootState} from '../../../../types'
import { getInitials } from '../../../../utils/UserUtils'

export interface IProps {
  fontColor?: ColorValue
  backgroundColor?: ColorValue
  activeUser: IUser
}

const SSIProfileIcon: FC<IProps> = (props: IProps): JSX.Element => {
  const { fontColor = fonts.light, backgroundColor = entities['100'] } = props

  return (
    <ProfileIconBackground
      style={{
        backgroundColor: backgroundColor,

      }}
    >
      <ProfileIconText style={{ color: fontColor }}>{getInitials(`${props.activeUser?.firstName} ${props.activeUser?.lastName}`)}</ProfileIconText>
    </ProfileIconBackground>
  )
}

const mapStateToProps = (state: RootState) => {
  return {
    activeUser: state.user.activeUser
  }
}

export default connect(mapStateToProps, null)(SSIProfileIcon)
