import React, {FC} from 'react';

import {SSIDropDownListContainerStyled as Container} from '../../../styles/components';
import {IHeaderMenuButton} from '../../../types';
import SSIDropDownListItem from '../SSIDropDownListItem';

export interface IProps {
  buttons: Array<IHeaderMenuButton>;
}

const SSIDropDownList: FC<IProps> = (props: IProps): JSX.Element => {
  const getItems = () => {
    const {buttons} = props;
    return buttons.map((item: IHeaderMenuButton, index: number) => {
      const showBorder = buttons.length > 1 && index !== buttons.length - 1;
      return (
        <SSIDropDownListItem
          key={index}
          showBorder={showBorder}
          caption={item.caption}
          onPress={item.onPress}
          icon={item.icon}
          fontColor={item.fontColor}
        />
      );
    });
  };

  return <Container>{getItems()}</Container>;
};

export default SSIDropDownList;
