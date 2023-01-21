import React, { FC } from 'react'

import {
  SSIConnectionViewItemContactDetailsContainerStyled as ContactDetailsContainer,
  SSIConnectionViewItemContainerStyled as Container,
  SSITextH3LightStyled as NameCaption,
  SSITextH4LightStyled as UriCaption
} from '../../../styles/components'

export interface IProps {
  name: string
  uri: string
}

const SSIConnectionViewItem: FC<IProps> = (props: IProps): JSX.Element => {
  const { name, uri } = props

  return (
    <Container>
      <ContactDetailsContainer>
        <NameCaption>{name}</NameCaption>
        <UriCaption>{uri}</UriCaption>
      </ContactDetailsContainer>
    </Container>
  )
}

export default SSIConnectionViewItem
