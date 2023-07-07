import React, {FC} from 'react';
import {View} from 'react-native';

import {
  SSIToastMessageCaptionStyled as MessageCaption,
  SSIFlexDirectionRowViewStyled as MessageContainer,
  SSITextH2SemiBoldStyled as TitleCaption,
  SSIToastTitleContainerStyled as TitleContainer,
  SSIToastBadgeContainerStyled as ToastBadgeContainer,
  SSIToastContainerStyled as ToastContainer,
} from '../../../../styles/components';
import {IToastConfigParams, ToastTypeEnum} from '../../../../types';
import {SSICheckmarkBadge, SSIExclamationMarkBadge} from '@sphereon/ui-components.ssi-react-native';

export interface IProps extends IToastConfigParams {
  type: ToastTypeEnum;
}

const getBadge = (type: ToastTypeEnum) => {
  switch (type) {
    case ToastTypeEnum.TOAST_SUCCESS:
      return <SSICheckmarkBadge />;
    case ToastTypeEnum.TOAST_ERROR:
      return <SSIExclamationMarkBadge />;
    default:
      return <View />;
  }
};

const SSIToast: FC<IProps> = (props: IProps): JSX.Element => {
  const {type, title, message, showBadge = true} = props;

  return (
    <ToastContainer>
      {title && (
        <TitleContainer>
          {showBadge && <ToastBadgeContainer>{getBadge(type)}</ToastBadgeContainer>}
          <TitleCaption>{title}</TitleCaption>
        </TitleContainer>
      )}
      <MessageContainer>
        {!title && showBadge && <ToastBadgeContainer>{getBadge(type)}</ToastBadgeContainer>}
        {message && <MessageCaption style={{textAlign: showBadge ? undefined : 'center'}}>{message}</MessageCaption>}
      </MessageContainer>
    </ToastContainer>
  );
};

export default SSIToast;
