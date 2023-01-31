import React, { FC } from 'react'
import { ColorValue, KeyboardTypeOptions, NativeSyntheticEvent, TextInputEndEditingEventData } from 'react-native'

import { inputs, selectionElements, statuses } from '../../../styles/colors'
import {
  SSITextInputFieldContainerStyled as Container,
  SSITextInputFieldHelperContainerStyled as HelperContainer,
  SSITextInputFieldIconContainerStyled as IconContainer,
  SSIFlexDirectionRowViewStyled as InputContainer,
  SSITextH5Styled as LabelCaption,
  SSITextInputFieldLinearTextGradientStyled as LinearTextGradient,
  SSITextInputFieldTextInputStyled as TextInput,
  SSITextInputFieldUnderlineStyled as Underline,
  SSITextInputFieldUnderlineLinearGradientStyled as UnderlineLinearGradient
} from '../../../styles/components'
import SSIEyeIcon from '../../assets/icons/SSIEyeIcon'

export interface IProps {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' | undefined
  autoFocus?: boolean
  borderColor?: ColorValue
  disabled?: boolean
  editable?: boolean
  helperText?: string
  initialValue?: string
  label?: string
  labelColor?: ColorValue
  keyboardType?: KeyboardTypeOptions | undefined
  maxLength?: number
  onChangeText?: (input: string) => Promise<void>
  onEndEditing?: (input: string) => Promise<void>
  onFocus?: () => Promise<void>
  placeholderValue?: string
  secureTextEntry?: boolean
  showBorder?: boolean
}

const SSITextInputField: FC<IProps> = (props: IProps): JSX.Element => {
  const {
    autoCapitalize = undefined,
    autoFocus = false,
    borderColor = selectionElements.primaryBorderDark,
    disabled = false,
    editable = true,
    helperText,
    initialValue,
    label,
    labelColor,
    keyboardType = undefined,
    maxLength,
    onChangeText,
    onEndEditing,
    onFocus,
    placeholderValue,
    secureTextEntry = false,
    showBorder = true
  } = props

  const [value, setValue] = React.useState(initialValue)
  const [error, setError] = React.useState<string>()
  const [hasFocus, setHasFocus] = React.useState(false)

  const onChange = async (input: string): Promise<void> => {
    setValue(input)
    if (onChangeText) {
      onChangeText(input)
        .then(() => setError(undefined))
        .catch((error: Error) => setError(error.message))
    }
  }

  const onEditingEnd = async (event: NativeSyntheticEvent<TextInputEndEditingEventData>): Promise<void> => {
    if (onEndEditing) {
      onEndEditing(event.nativeEvent.text)
        .then(() => setError(undefined))
        .catch((error: Error) => setError(error.message))
    }
  }

  const onBlur = async (): Promise<void> => {
    setHasFocus(false)
  }

  const _onFocus = async (): Promise<void> => {
    setHasFocus(true)
    if (onFocus) {
      await onFocus()
    }
  }

  return (
    <Container>
      {label ? (
        labelColor || error ? (
          <LabelCaption style={{ color: error ? statuses.error : labelColor, opacity: disabled ? 0.5 : 1 }}>
            {label}
          </LabelCaption>
        ) : (
          <LinearTextGradient style={{ opacity: disabled ? 0.5 : 1 }}>
            <LabelCaption>{label}</LabelCaption>
          </LinearTextGradient>
        )
      ) : null}
      <InputContainer>
        <TextInput
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
          editable={editable && !disabled}
          keyboardType={keyboardType}
          placeholder={placeholderValue}
          maxLength={maxLength}
          onBlur={onBlur}
          onChangeText={onChange}
          onEndEditing={onEditingEnd}
          onFocus={_onFocus}
          value={value}
          style={{ opacity: disabled ? 0.5 : 1 }}
        />
        {secureTextEntry && (
          // TODO pressing the icon should reveal the input. Will be implemented when we start using this for sensitive data etc
          <IconContainer style={{ opacity: disabled ? 0.5 : 1 }}>
            <SSIEyeIcon />
          </IconContainer>
        )}
      </InputContainer>
      {hasFocus && !error ? (
        <UnderlineLinearGradient />
      ) : (
        <Underline
          style={{
            borderBottomColor: error ? statuses.error : borderColor,
            borderBottomWidth: showBorder ? 1 : 0,
            opacity: disabled ? 0.5 : 1
          }}
        />
      )}
      <HelperContainer>
        {(helperText || error) && (
          <LabelCaption style={{ color: error ? statuses.error : inputs.placeholder, opacity: disabled ? 0.5 : 1 }}>
            {error ? error : helperText}
          </LabelCaption>
        )}
      </HelperContainer>
    </Container>
  )
}

export default SSITextInputField
