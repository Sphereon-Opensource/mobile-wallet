import React, {FC} from 'react';
import {PressableProps, ViewStyle} from 'react-native';
import {SSIExclamationMarkBadge} from '@sphereon/ui-components.ssi-react-native';
import {BadgeButtonContainerStyled as Container, SSITextH3RegularLightStyled as Caption} from '../../../styles/components';
import {OpacityStyleEnum} from '../../../types';

export interface Props extends Omit<PressableProps, 'disabled'> {
  caption: string;
  onPress: () => Promise<void>;
  disabled?: boolean | (() => boolean);
  style?: ViewStyle;
}

const BadgeButton: FC<Props> = (props: Props): JSX.Element => {
  const {caption, onPress, style} = props;
  const disabled = typeof props.disabled === 'function' ? props.disabled() : props.disabled;

  return (
    <Container onPress={onPress} disabled={disabled} activeOpacity={0.5} style={{...style, ...(disabled && {opacity: OpacityStyleEnum.DISABLED})}}>
      <SSIExclamationMarkBadge />
      <Caption>{caption}</Caption>
    </Container>
  );
};

export default BadgeButton;
