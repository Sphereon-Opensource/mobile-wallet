import React, { FC } from 'react'
import { TouchableOpacity, ViewStyle } from 'react-native'

import { HIT_SLOP_DISTANCE } from '../../../@config/constants'
import {
  SSICheckboxSelectedContainerStyled as SelectedContainer,
  SSICheckboxUnselectedContainerStyled as UnselectedContainer
} from '../../../styles/components'

export interface IProps {
  onValueChange?: () => Promise<void>
  initialValue?: boolean
  // This value can be used to control the checkbox from the outside
  isChecked?: boolean
  style?: ViewStyle
}

const SSICheckbox: FC<IProps> = (props: IProps): JSX.Element => {
  const [isChecked, setChecked] = React.useState(props.initialValue || false)

  const value = props.isChecked || isChecked

  const onValueChange = () => {
    const { onValueChange } = props
    if (onValueChange) {
      onValueChange().then(() => setChecked(!isChecked))
    } else {
      setChecked(!isChecked)
    }
  }

  return (
    <TouchableOpacity
      onPress={onValueChange}
      hitSlop={{
        top: HIT_SLOP_DISTANCE,
        bottom: HIT_SLOP_DISTANCE,
        left: HIT_SLOP_DISTANCE,
        right: HIT_SLOP_DISTANCE
      }}
    >
      <UnselectedContainer style={{ backgroundColor: props.style?.backgroundColor }}>
        {value && <SelectedContainer />}
      </UnselectedContainer>
    </TouchableOpacity>
  )
}

export default SSICheckbox
