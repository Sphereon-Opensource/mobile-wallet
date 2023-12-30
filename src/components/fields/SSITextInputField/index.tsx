import React, {FC} from 'react';
import {ColorValue, KeyboardTypeOptions, NativeSyntheticEvent, TextInputEndEditingEventData} from 'react-native';

import {inputs} from '../../../styles/colors';
import {
  SSITextInputFieldContainerStyled as Container,
  SSITextInputFieldHelperContainerStyled as HelperContainer,
  SSITextInputFieldIconContainerStyled as IconContainer,
  SSIFlexDirectionRowViewStyled as InputContainer,
  SSITextH5Styled as LabelCaption,
  SSITextFieldLinearTextGradientStyled as LinearTextGradient,
  SSITextInputFieldTextInputStyled as TextInput,
  SSITextInputFieldUnderlineStyled as Underline,
  SSITextInputFieldUnderlineLinearGradientStyled as UnderlineLinearGradient,
} from '../../../styles/components';
import {OpacityStyleEnum} from '../../../types';
import SSIEyeIcon from '../../assets/icons/SSIEyeIcon';
import {selectionElementColors, statusColors} from '@sphereon/ui-components.core';

export interface IProps {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' | undefined;
  autoFocus?: boolean;
  autoComplete?:
    | 'birthdate-day'
    | 'birthdate-full'
    | 'birthdate-month'
    | 'birthdate-year'
    | 'cc-csc'
    | 'cc-exp'
    | 'cc-exp-day'
    | 'cc-exp-month'
    | 'cc-exp-year'
    | 'cc-number'
    | 'email'
    | 'gender'
    | 'name'
    | 'name-family'
    | 'name-given'
    | 'name-middle'
    | 'name-middle-initial'
    | 'name-prefix'
    | 'name-suffix'
    | 'password'
    | 'password-new'
    | 'postal-address'
    | 'postal-address-country'
    | 'postal-address-extended'
    | 'postal-address-extended-postal-code'
    | 'postal-address-locality'
    | 'postal-address-region'
    | 'postal-code'
    | 'street-address'
    | 'sms-otp'
    | 'tel'
    | 'tel-country-code'
    | 'tel-national'
    | 'tel-device'
    | 'username'
    | 'username-new'
    | 'off'
    | undefined;
  borderColor?: ColorValue;
  disabled?: boolean;
  editable?: boolean;
  helperText?: string;
  initialValue?: string;
  label?: string;
  labelColor?: ColorValue;
  keyboardType?: KeyboardTypeOptions | undefined;
  maxLength?: number;
  onChangeText?: (value: string) => Promise<void>;
  onEndEditing?: (value: string) => Promise<void>;
  onFocus?: () => Promise<void>;
  placeholderValue?: string;
  secureTextEntry?: boolean;
  showBorder?: boolean;
}

const SSITextInputField: FC<IProps> = (props: IProps): JSX.Element => {
  const {
    autoCapitalize = undefined,
    autoComplete,
    autoFocus = false,
    borderColor = selectionElementColors.primaryBorderDark,
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
    showBorder = true,
  } = props;

  const [value, setValue] = React.useState(initialValue);
  const [error, setError] = React.useState<string>();
  const [hasFocus, setHasFocus] = React.useState(false);

  const onChange = async (value: string): Promise<void> => {
    setValue(value);
    if (onChangeText) {
      onChangeText(value)
        .then(() => setError(undefined))
        .catch((error: Error) => setError(error.message));
    }
  };

  const onEditingEnd = async (event: NativeSyntheticEvent<TextInputEndEditingEventData>): Promise<void> => {
    if (onEndEditing) {
      onEndEditing(event.nativeEvent.text)
        .then(() => setError(undefined))
        .catch((error: Error) => setError(error.message));
    }
  };

  const onBlur = async (): Promise<void> => {
    setHasFocus(false);
  };

  const _onFocus = async (): Promise<void> => {
    setHasFocus(true);
    if (onFocus) {
      await onFocus();
    }
  };

  return (
    <Container>
      {label ? (
        labelColor || error ? (
          <LabelCaption
            style={{
              color: error ? statusColors.error : labelColor,
              ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
            }}>
            {label}
          </LabelCaption>
        ) : (
          <LinearTextGradient style={{...(disabled && {opacity: OpacityStyleEnum.DISABLED})}}>
            <LabelCaption>{label}</LabelCaption>
          </LinearTextGradient>
        )
      ) : null}
      <InputContainer>
        <TextInput
          secureTextEntry={secureTextEntry}
          autoComplete={autoComplete}
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
          style={{...(disabled && {opacity: OpacityStyleEnum.DISABLED})}}
        />
        {secureTextEntry && (
          // TODO pressing the icon should reveal the input. Will be implemented when we start using this for sensitive data etc
          <IconContainer style={{...(disabled && {opacity: OpacityStyleEnum.DISABLED})}}>
            <SSIEyeIcon />
          </IconContainer>
        )}
      </InputContainer>
      {hasFocus && !error ? (
        <UnderlineLinearGradient />
      ) : (
        <Underline
          style={{
            ...(showBorder && {borderBottomWidth: 1, borderBottomColor: error ? statusColors.error : borderColor}),
            ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
          }}
        />
      )}
      <HelperContainer>
        {(helperText || error) && (
          <LabelCaption
            style={{
              color: error ? statusColors.error : inputs.placeholder,
              ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
            }}>
            {error ? error : helperText}
          </LabelCaption>
        )}
      </HelperContainer>
    </Container>
  );
};

export default SSITextInputField;
