import React, { FC } from 'react'
import { ViewStyle } from 'react-native'

import {
  SSIFlexDirectionRowViewStyled as Container,
  SSICredentialSelectTypeViewItemContentContainerStyled as ContentContainer,
  SSICredentialSelectTypeViewItemContentTextContainerStyled as ContentTextContainer,
  SSITextH4LightStyled as CredentialTypeCaption,
  SSICredentialSelectTypeViewItemLogoCheckboxContainerStyled as LogoCheckboxContainer,
  SSICredentialSelectTypeViewItemLogoContainerStyled as LogoContainer
} from '../../../styles/components'
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
