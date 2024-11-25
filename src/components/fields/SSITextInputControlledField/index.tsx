import React, {useContext} from 'react';
import {TextInputProps} from 'react-native';

import {selectionElementColors, statusColors} from '@sphereon/ui-components.core';
import {AccessibilityContext} from '../../../contexts/AccessibiltyContext';
import {inputs} from '../../../styles/colors';
import {
  SSITextInputFieldContainerStyled as Container,
  SSITextInputFieldHelperContainerStyled as HelperContainer,
  SSITextInputFieldIconContainerStyled as IconContainer,
  SSIFlexDirectionRowViewStyled as InputContainer,
  SSITextH5Styled as LabelCaption,
  SSITextFieldLinearTextGradientStyled as LinearTextGradient,
  SSITextH5StyleObject,
  SSITextInputFieldUnderlineLightStyled,
  SSITextInputFieldTextInputStyled as StyledTextInput,
  SSITextInputFieldUnderlineStyled as Underline,
} from '../../../styles/components';
import {OpacityStyleEnum} from '../../../types';
import SSIEyeIcon from '../../assets/icons/SSIEyeIcon';

export interface IProps extends TextInputProps {
  error?: string;
  label?: string;
  labelColor?: string;
  disabled?: boolean;
  helperText?: string;
  borderColor?: string;
  showBorder?: boolean;
  endAdornment?: JSX.Element;
}

const SSITextInputControlledField = (props: IProps) => {
  const {
    error,
    label,
    labelColor,
    disabled = false,
    helperText,
    borderColor = selectionElementColors.primaryBorderDark,
    showBorder = true,
    value,
    secureTextEntry = false,
    endAdornment,
    style: textInputStyle,
    ...TextInputProps
  } = props;
  const {announce} = useContext(AccessibilityContext);
  if (error) {
    announce({
      message: error,
      queue: true,
    });
  }

  return (
    <Container>
      {label ? (
        labelColor || error ? (
          <LabelCaption
            importantForAccessibility="no"
            style={{
              color: error ? statusColors.expired : labelColor,
              ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
            }}>
            {label}
          </LabelCaption>
        ) : (
          <LinearTextGradient
            text={label}
            textStyle={{
              ...SSITextH5StyleObject,
              ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
            }}
          />
        )
      ) : null}
      <InputContainer>
        <StyledTextInput
          accessibilityLabel={label}
          value={value}
          style={[
            textInputStyle,
            {
              opacity: disabled ? OpacityStyleEnum.DISABLED : 1,
            },
          ]}
          {...TextInputProps}
        />
        {secureTextEntry && (
          // TODO pressing the icon should reveal the input. Will be implemented when we start using this for sensitive data etc
          <IconContainer style={{...(disabled && {opacity: OpacityStyleEnum.DISABLED})}}>
            <SSIEyeIcon />
          </IconContainer>
        )}
        {endAdornment && <IconContainer style={{...(disabled && {opacity: OpacityStyleEnum.DISABLED})}}>{endAdornment}</IconContainer>}
      </InputContainer>
      {!error ? (
        <SSITextInputFieldUnderlineLightStyled />
      ) : (
        <Underline
          style={{
            ...(showBorder && {borderBottomWidth: 1, borderBottomColor: error ? statusColors.expired : borderColor}),
            ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
          }}
        />
      )}
      <HelperContainer>
        {(helperText || error) && (
          <LabelCaption
            importantForAccessibility="no"
            style={{
              color: error ? statusColors.expired : inputs.placeholder,
              ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
            }}>
            {error ? error : helperText}
          </LabelCaption>
        )}
      </HelperContainer>
    </Container>
  );
};

export default SSITextInputControlledField;
