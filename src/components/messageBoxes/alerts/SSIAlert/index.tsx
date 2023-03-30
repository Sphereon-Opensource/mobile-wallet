import React, {FC} from 'react';

import {
  SSIAlertButtonStyled as Button,
  SSITextH2DarkStyled as ButtonCaption,
  SSIAlertButtonContainerStyled as ButtonContainer,
  SSIAlertContainerStyled as Container,
  SSIAlertMessageContainerStyled as MessageContainer,
  SSIAlertMessageTextStyled as MessageText,
} from '../../../../styles/components';
import {IButton} from '../../../../types';

export interface IProps {
  message: string;
  buttons: Array<IButton>;
}

const SSIAlert: FC<IProps> = (props: IProps): JSX.Element => {
  return (
    <Container>
      <MessageContainer>
        <MessageText>{props.message}</MessageText>
      </MessageContainer>
      {props.buttons && (
        <ButtonContainer>
          {props.buttons.map((button: IButton, index: number) => (
            <Button key={index} onPress={button.onPress}>
              <ButtonCaption>{button.caption}</ButtonCaption>
            </Button>
          ))}
        </ButtonContainer>
      )}
    </Container>
  );
};

export default SSIAlert;
