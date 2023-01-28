import React, { FC } from 'react'

import { IButton } from '../../../@types'
import {
  SSIWelcomeViewBodyContainerStyled as BodyContainer,
  SSITextH3RegularLightStyled as BodyText,
  SSIButtonBottomSingleContainerStyled as ButtonContainer,
  SSIWelcomeViewContainerStyled as Container,
  SSIWelcomeViewContentContainerStyled as ContentContainer,
  SSIWelcomeViewHeaderTextStyled as HeaderCaption,
  SSIWelcomeViewProgressIndicatorContainerStyled as ProgressIndicatorContainer,
  SSIWelcomeViewTitleTextStyled as TitleCaption
} from '../../../styles/components'
import SSIPrimaryButton from '../../buttons/SSIPrimaryButton'
import SSIProgressIndicator from '../../indicators/SSIProgressIndicator'

export interface IProps {
  step: number
  maxSteps: number
  header: string
  title: string
  body: string
  action: IButton
}

const SSIWelcomeView: FC<IProps> = (props: IProps): JSX.Element => {
  const { action, body, header, step, title, maxSteps } = props

  return (
    <Container>
      <ProgressIndicatorContainer>
        <SSIProgressIndicator step={step} maxSteps={maxSteps} />
      </ProgressIndicatorContainer>
      <ContentContainer>
        <HeaderCaption>{header}</HeaderCaption>
        <TitleCaption>{title}</TitleCaption>
        <BodyContainer>
          <BodyText>{body}</BodyText>
        </BodyContainer>
      </ContentContainer>
      <ButtonContainer>
        <SSIPrimaryButton
          // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
          style={{ height: 42, width: 300 }}
          title={action.caption}
          onPress={action.onPress}
        />
      </ButtonContainer>
    </Container>
  )
}

export default SSIWelcomeView
