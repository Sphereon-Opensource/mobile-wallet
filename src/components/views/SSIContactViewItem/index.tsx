import { FC } from 'react'

import {
  SSIContactViewItemContactDetailsContainerStyled as ContactDetailsContainer,
  SSIContactViewItemContactRoleCaptionStyled as ContactRoleCaption,
  SSIContactViewItemContactRoleContainerStyled as ContactRoleContainer,
  SSIContactViewItemContainerStyled as Container,
  SSIContactViewItemLogoContainerStyled as LogoContainer,
  SSIContactViewItemPlaceholderLogoStyled as PlaceholderLogo,
  SSIContactViewItemNewStatusContainerStyled as StatusContainer,
  SSIContactViewItemTextContainerStyled as TextContainer
} from '../../../styles/components'
import {
  SSITextH3LightStyled as ContactNameCaption,
  SSITextH4LightStyled as ContactUriCaption
} from '../../../styles/styledComponents'

export interface Props {
  id: string
  name: string
  uri: string
  role?: string
}

const SSIContactViewItem: FC<Props> = (props: Props): JSX.Element => {
  const { name, uri, role } = props

  return (
    <Container>
      <StatusContainer />
      <LogoContainer>
        <PlaceholderLogo />
      </LogoContainer>
      <TextContainer>
        <ContactDetailsContainer>
          <ContactNameCaption>{name}</ContactNameCaption>
          <ContactUriCaption>{uri}</ContactUriCaption>
        </ContactDetailsContainer>
        <ContactRoleContainer>
          <ContactRoleCaption>{role}</ContactRoleCaption>
        </ContactRoleContainer>
      </TextContainer>
    </Container>
  )
}

export default SSIContactViewItem
