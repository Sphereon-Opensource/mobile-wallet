import React, { FC } from 'react'
import { ColorValue } from 'react-native'
import { connect } from 'react-redux'

import { entities, fonts } from '../../../../styles/colors'
import {
  SSIEntityIconStyled as SSIProfileIconBackground,
  SSITextH2LightStyled as SSIProfileIconText
} from '../../../../styles/components'
import {IUser, RootState} from '../../../../types'
import { getDefaultUserNameInitials } from '../../../../utils/UserUtils'

export interface IProps {
  size?: number
  fontColor?: ColorValue
  backgroundColor?: ColorValue
  activeUser: IUser
}

const SSIEntityIcon: FC<IProps> = (props: IProps): JSX.Element => {
  const { size = 34, fontColor = fonts.light, backgroundColor = entities['100'] } = props

  return (
    <SSIProfileIconBackground
      style={{
        backgroundColor: backgroundColor,
        width: size
      }}
    >
      <SSIProfileIconText style={{ color: fontColor }}>{getDefaultUserNameInitials(props.activeUser?.firstName, props.activeUser?.lastName)}</SSIProfileIconText>
    </SSIProfileIconBackground>
  )
}

const mapStateToProps = (state: RootState) => {
  return {
    activeUser: state.user.activeUser
  }
}

export default connect(mapStateToProps, null)(SSIEntityIcon)
