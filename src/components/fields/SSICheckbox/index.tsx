import React, { FC } from 'react'
import { ColorValue, TouchableOpacity } from 'react-native'

import { HIT_SLOP_DISTANCE } from '../../../@config/constants'
import { fonts, selectionElements } from '../../../styles/colors'
import {
  SSIFlexDirectionRowViewStyled as Container,
  SSITextH4LightStyled as LabelCaption,
  SSICheckboxSelectedContainerStyled as SelectedContainer,
  SSICheckboxUnselectedContainerStyled as UnselectedContainer
} from '../../../styles/components'

export interface IProps {
  onValueChange?: (isChecked: boolean) => Promise<void>
  initialValue?: boolean
  // This value can be used to control the checkbox from the outside
  isChecked?: boolean
  label?: string
  disabled?: boolean
  backgroundColor?: ColorValue
  borderColor?: ColorValue
  selectedColor?: ColorValue
  labelColor?: ColorValue
}

const SSICheckbox: FC<IProps> = (props: IProps): JSX.Element => {
  const {
    backgroundColor,
    borderColor = selectionElements.primaryBorderDark,
    disabled = false,
    initialValue,
    label,
    selectedColor = selectionElements.primaryDark,
    labelColor = fonts.light
  } = props
  const [isChecked, setChecked] = React.useState(initialValue || false)
  const value = props.isChecked || isChecked

  const onValueChange = () => {
    const { onValueChange } = props
    if (onValueChange) {
      onValueChange(!isChecked).then(() => setChecked(!isChecked))
    } else {
      setChecked(!isChecked)
    }
  }

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onValueChange}
      hitSlop={{
        top: HIT_SLOP_DISTANCE,
        bottom: HIT_SLOP_DISTANCE,
        left: HIT_SLOP_DISTANCE,
        right: HIT_SLOP_DISTANCE
      }}
    >
      <Container>
        <UnselectedContainer
          style={{ backgroundColor, marginRight: label ? 10 : 0, borderColor, opacity: disabled ? 0.5 : 1 }}
        >
          {value && <SelectedContainer style={{ backgroundColor: selectedColor, opacity: disabled ? 0.5 : 1 }} />}
        </UnselectedContainer>
        {label && <LabelCaption style={{ color: labelColor, opacity: disabled ? 0.5 : 1 }}>{label}</LabelCaption>}
      </Container>
    </TouchableOpacity>
  )
}

export default SSICheckbox
