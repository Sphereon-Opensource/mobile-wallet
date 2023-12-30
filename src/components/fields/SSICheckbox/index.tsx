import React, {FC} from 'react';
import {ColorValue, TouchableOpacity} from 'react-native';

import {HIT_SLOP_DISTANCE} from '../../../@config/constants';
import {
  SSIFlexDirectionRowViewStyled as Container,
  SSICheckboxLabelContainerStyled as LabelCaption,
  SSICheckboxSelectedContainerStyled as SelectedContainer,
  SSICheckboxUnselectedContainerStyled as UnselectedContainer,
} from '../../../styles/components';
import {OpacityStyleEnum} from '../../../types';
import {fontColors, selectionElementColors} from '@sphereon/ui-components.core';

export interface IProps {
  onValueChange?: (isChecked: boolean) => Promise<void>;
  initialValue?: boolean;
  // This value can be used to control the checkbox from the outside
  isChecked?: boolean;
  label?: string;
  disabled?: boolean;
  backgroundColor?: ColorValue;
  borderColor?: ColorValue;
  selectedColor?: ColorValue;
  labelColor?: ColorValue;
}

const SSICheckbox: FC<IProps> = (props: IProps): JSX.Element => {
  const {
    backgroundColor,
    borderColor = selectionElementColors.primaryBorderDark,
    disabled = false,
    initialValue,
    label,
    selectedColor = selectionElementColors.primaryDark,
    labelColor = fontColors.light,
  } = props;
  const [isChecked, setChecked] = React.useState(initialValue || false);
  const value = props.isChecked !== undefined ? props.isChecked : isChecked;

  const onValueChange = () => {
    const {onValueChange} = props;
    if (onValueChange) {
      onValueChange(!isChecked).then(() => setChecked(!isChecked));
    } else {
      setChecked(!isChecked);
    }
  };

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onValueChange}
      hitSlop={{
        top: HIT_SLOP_DISTANCE,
        bottom: HIT_SLOP_DISTANCE,
        left: HIT_SLOP_DISTANCE,
        right: HIT_SLOP_DISTANCE,
      }}>
      <Container>
        {value ? (
          <SelectedContainer
            style={{backgroundColor: selectedColor, ...(label && {marginRight: 10}), ...(disabled && {opacity: OpacityStyleEnum.DISABLED})}}
          />
        ) : (
          <UnselectedContainer
            style={{backgroundColor, ...(label && {marginRight: 10}), borderColor, ...(disabled && {opacity: OpacityStyleEnum.DISABLED})}}
          />
        )}
        {label && <LabelCaption style={{color: labelColor, ...(disabled && {opacity: OpacityStyleEnum.DISABLED})}}>{label}</LabelCaption>}
      </Container>
    </TouchableOpacity>
  );
};

export default SSICheckbox;
