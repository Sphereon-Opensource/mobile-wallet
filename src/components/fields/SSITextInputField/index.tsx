import React, { FC } from 'react'
import { KeyboardTypeOptions, NativeSyntheticEvent, TextInputEndEditingEventData } from 'react-native'

import { inputs, selectionElements, statuses } from '../../../styles/colors'
import {
  SSITextInputFieldContainerStyled as Container,
  SSITextInputFieldIconContainerStyled as IconContainer,
  SSITextInputFieldLinearTextGradientStyled as LinearTextGradient,
  SSITextInputFieldTextInputStyled as TextInput,
  SSITextInputFieldUnderlineStyled as Underline,
  SSITextInputFieldUnderlineLinearGradientStyled as UnderlineLinearGradient
} from '../../../styles/components'
import {
  SSIFlexDirectionRowViewStyled as InputContainer,
  SSITextH5Styled as LabelCaption
} from '../../../styles/styledComponents'
import SSIEyeIcon from '../../assets/icons/SSIEyeIcon'

export interface IProps {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' | undefined
  autoFocus?: boolean
  borderColor?: string
  defaultValue?: string
  disabled?: boolean
  editable?: boolean
  helperText?: string
  label?: string
  labelColor?: string
  keyboardType?: KeyboardTypeOptions | undefined
  maxLength?: number
  onChangeText?: (input: string) => Promise<void>
  onEndEditing?: (input: string) => Promise<void>
  placeholderValue?: string
  secureTextEntry?: boolean
  showBorder?: boolean
}

const SSITextInputField: FC<IProps> = (props: IProps): JSX.Element => {
  const {
    autoCapitalize = undefined,
    autoFocus = false,
    borderColor = selectionElements.primaryBorderDark,
    defaultValue,
    disabled = false,
    editable = true,
    helperText,
    label,
    labelColor,
    keyboardType = undefined,
    maxLength,
    onChangeText,
    onEndEditing,
    placeholderValue,
    secureTextEntry = false,
    showBorder = true
  } = props

  const [value, setValue] = React.useState(defaultValue)
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
    console.log(event.nativeEvent.text)
    if (onEndEditing)  {
      await onEndEditing(event.nativeEvent.text)
    }
  }

  return (
      <Container>
          {
            label
                ? labelColor || error
                    ? <LabelCaption style={{color: error ? statuses.error : labelColor, opacity: disabled ? 0.5 : 1}}>{label}</LabelCaption>
                    : <LinearTextGradient style={{ opacity: disabled ? 0.5 : 1 }}>
                      <LabelCaption>{label}</LabelCaption>
                    </LinearTextGradient>
                : null
          }
          <InputContainer>
            <TextInput
                secureTextEntry={secureTextEntry}
                autoCapitalize={autoCapitalize}
                autoFocus={autoFocus}
                editable={editable && !disabled}
                keyboardType={keyboardType}
                placeholder={placeholderValue}
                maxLength={maxLength}
                onBlur={() => setHasFocus(false)}
                onChangeText={(input: string) => onChange(input)}
                onEndEditing={(event: NativeSyntheticEvent<TextInputEndEditingEventData>) => onEditingEnd(event)}
                onFocus={() => setHasFocus(true)}
                value={value}
                style={{ opacity: disabled ? 0.5 : 1 }}
            />
            { secureTextEntry &&
                // TODO pressing the icon should reveal the input. Will be implemented when we start using this for sensitive data etc
                <IconContainer style={{opacity: disabled ? 0.5 : 1}}>
                  <SSIEyeIcon/>
                </IconContainer>
            }
          </InputContainer>
          { hasFocus && !error
              ? <UnderlineLinearGradient/>
              : <Underline style={{ borderBottomColor: error ? statuses.error : borderColor, borderBottomWidth: showBorder ? 1 : 0, opacity: disabled ? 0.5 : 1 }}/>
          }
          { helperText || error &&
              <LabelCaption style={{ color: error ? statuses.error : inputs.placeholder, opacity: disabled ? 0.5 : 1 }}>{error ? error : helperText}</LabelCaption>
          }
      </Container>
  )
}

export default SSITextInputField
