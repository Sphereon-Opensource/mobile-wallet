import React, { FC } from 'react'
import { ViewStyle } from 'react-native'

import {
  SSICredentialSelectTypeViewItemContentContainerStyled as ContentContainer,
  SSICredentialSelectTypeViewItemContentTextContainerStyled as ContentTextContainer,
  SSICredentialSelectTypeViewItemLogoCheckboxContainerStyled as LogoCheckboxContainer,
  SSICredentialSelectTypeViewItemLogoContainerStyled as LogoContainer
} from '../../../styles/components'
import {
  SSIFlexDirectionRowViewStyled as Container,
  SSITextH4LightStyled as CredentialTypeCaption
} from '../../../styles/styledComponents'
import SSICredentialLogo from '../../assets/logos/SSICredentialLogo'
import SSICheckbox from '../../fields/SSICheckbox'

export interface Props {
  id: string
  title: string
  isSelected: boolean
  image?: string // TODO WAL-302 Support passing in storage location
  style?: ViewStyle
}

const SSICredentialSelectTypeViewItem: FC<Props> = (props: Props): JSX.Element => {
  const { image, style, title } = props

  return (
    <Container>
      <LogoContainer>
        <SSICredentialLogo image={image} />
        <LogoCheckboxContainer>
          <SSICheckbox isChecked={props.isSelected} style={{ backgroundColor: style?.backgroundColor }} />
        </LogoCheckboxContainer>
      </LogoContainer>
      <ContentContainer>
        <ContentTextContainer>
          <CredentialTypeCaption>{title}</CredentialTypeCaption>
        </ContentTextContainer>
      </ContentContainer>
    </Container>
  )
}

export default SSICredentialSelectTypeViewItem
