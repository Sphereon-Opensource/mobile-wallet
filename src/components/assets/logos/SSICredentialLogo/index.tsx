import React, { FC } from 'react'
import { ViewStyle } from 'react-native'

import { credentialLogos } from '../../../../styles/colors'
import {
  SSICredentialLogoImageStyled as BackgroundImage,
  SSICredentialLogoContainerStyled as Container,
  SSICredentialLogoPlaceholderImageStyled as PlaceholderImage
} from '../../../../styles/components'

export interface IProps {
  backgroundColor?: string
  image?: string // TODO WAL-302 Support passing in storage location
  style?: ViewStyle
}

const SSICredentialLogo: FC<IProps> = (props: IProps): JSX.Element => {
  const { image, style, backgroundColor = credentialLogos.default } = props
  const backgroundImage = image ? { uri: image } : {}

  return (
    <Container style={[style, { backgroundColor }]}>
      <BackgroundImage source={backgroundImage}>{!image && <PlaceholderImage />}</BackgroundImage>
    </Container>
  )
}

export default SSICredentialLogo
