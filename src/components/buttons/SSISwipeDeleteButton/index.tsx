import React, {FC} from 'react';
import {Pressable} from 'react-native';

import SSIDeleteIcon from '../../../components/assets/icons/SSIDeleteIcon';
import {translate} from '../../../localization/Localization';
import {
  SSISwipeDeleteButtonCaptionStyled as ButtonCaption,
  SSISwipeDeleteButtonLinearGradientStyled as LinearGradient,
} from '../../../styles/components';

export interface IProps {
  onPress?: () => void;
}

const SSISwipeDeleteButton: FC<IProps> = (props: IProps): JSX.Element => {
  return (
    <Pressable onPress={props.onPress}>
      <LinearGradient>
        <SSIDeleteIcon />
        <ButtonCaption>{translate('swipe_delete_button_caption')}</ButtonCaption>
      </LinearGradient>
    </Pressable>
  );
};

export default SSISwipeDeleteButton;
