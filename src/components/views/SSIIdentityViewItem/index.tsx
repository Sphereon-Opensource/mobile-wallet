import React, { FC } from 'react'

import {
  SSIIdentityViewItemContactDetailsContainerStyled as IdentityDetailsContainer,
  SSIIdentityViewItemContainerStyled as Container,
  SSITextH3LightStyled as NameCaption,
  SSITextH4LightStyled as RolesCaption
} from '../../../styles/components'
import { IdentityRoleEnum } from '@sphereon/ssi-sdk-data-store'

export interface IProps {
  name: string
  roles: Array<IdentityRoleEnum>
}

const SSIIdentityViewItem: FC<IProps> = (props: IProps): JSX.Element => {
  const { name, roles } = props

  return (
    <Container>
      <IdentityDetailsContainer>
        <NameCaption>{name}</NameCaption>
        <RolesCaption>{roles.join(', ')}</RolesCaption>
      </IdentityDetailsContainer>
    </Container>
  )
}

export default SSIIdentityViewItem
