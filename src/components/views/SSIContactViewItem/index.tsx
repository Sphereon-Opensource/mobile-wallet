import { FC } from 'react'
import { View } from 'react-native'

import {
  SSIContactViewItemContactDetailsContainerStyled as ContactDetailsContainer,
  SSIContactViewItemContactRoleCaptionStyled as ContactRoleCaption,
  SSIContactViewItemContainerStyled as Container,
  SSIContactViewItemLogoContainerStyled as LogoContainer,
  SSIContactViewItemPlaceholderLogoStyled as PlaceholderLogo,
  SSIContactViewItemNewStatusContainerStyled as StatusContainer
} from '../../../styles/components'
import {
  SSITextH3LightStyled as ContactNameCaption,
  SSITextH4LightStyled as ContactUriCaption
} from '../../../styles/styledComponents'

export interface Props {
  id: string
  name: string
  uri?: string
  roles?: Array<string> // TODO format the roles for display
}

const SSIContactViewItem: FC<Props> = (props: Props): JSX.Element => {
  const { name, uri, roles } = props

  return (
    <Container>
      <StatusContainer />
      <LogoContainer>
        <PlaceholderLogo />
      </LogoContainer>
      <View>
        <ContactDetailsContainer>
          <ContactNameCaption>{name}</ContactNameCaption>
          <ContactUriCaption>{uri}</ContactUriCaption>
        </ContactDetailsContainer>
        <ContactRoleCaption>{roles}</ContactRoleCaption>
      </View>
    </Container>
  )
}

export default SSIContactViewItem
