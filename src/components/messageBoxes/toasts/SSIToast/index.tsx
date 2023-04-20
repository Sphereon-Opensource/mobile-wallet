import React, { FC } from 'react'
import {
  SSIFlexDirectionRowViewStyled as MessageContainer,
  SSIToastMessageCaptionStyled as MessageCaption,
  SSIToastBadgeContainerStyled as ToastBadgeContainer,
  SSIToastContainerStyled as ToastContainer,
  SSIToastTitleContainerStyled as TitleContainer,
  SSITextH2SemiBoldStyled as TitleCaption,
} from '../../../../styles/components'
import SSICheckmarkBadge from '../../../assets/badges/SSICheckmarkBadge'
import SSIErrorBadge from '../../../assets/badges/SSIExclamationMarkBadge'
import { IToastConfigParams, ToastTypeEnum } from '../../../../types'
import { View } from 'react-native'

export interface IProps extends IToastConfigParams {
  type: ToastTypeEnum
}

const getBadge = (type: ToastTypeEnum) => {
  switch (type) {
    case ToastTypeEnum.TOAST_SUCCESS:
      return <SSICheckmarkBadge />
    case ToastTypeEnum.TOAST_ERROR:
      return <SSIErrorBadge />
    default:
      return <View />;
  }
}

const SSIToast: FC<IProps> = (props: IProps): JSX.Element => {
  const { type, title, message, showBadge = true } = props

  return (
    <ToastContainer>
      { title &&
        <TitleContainer>
          { showBadge &&
            <ToastBadgeContainer>
              { getBadge(type) }
            </ToastBadgeContainer>
          }
          <TitleCaption>{title}</TitleCaption>
        </TitleContainer>
      }
      <MessageContainer>
        { !title && showBadge &&
          <ToastBadgeContainer>
            { getBadge(type) }
          </ToastBadgeContainer>
        }
        { message &&
          <MessageCaption style={{textAlign: showBadge ? undefined : 'center'}}>{message}</MessageCaption>
        }
      </MessageContainer>
    </ToastContainer>
  )
}

export default SSIToast
