import React, { FC } from 'react'
import { ColorValue, ViewStyle } from 'react-native'

import { credentialCards } from '../../../../styles/colors'
import {
  SSICredentialLogoImageStyled as BackgroundImage,
  SSICredentialLogoContainerStyled as Container,
  SSICredentialLogoPlaceholderImageStyled as PlaceholderImage
} from '../../../../styles/components'

export interface IProps {
  backgroundColor?: ColorValue
  image?: string // TODO WAL-302 Support passing in storage location
  style?: ViewStyle
}

const SSICredentialLogo: FC<IProps> = (props: IProps): JSX.Element => {
  const { image, style, backgroundColor = credentialCards.default } = props;
  // The uri is a transparent pixel in case there is not background image
  const backgroundImage = image
    ? { uri: image }
    : { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' }


  return (
    <Container style={[style, {backgroundColor}]}>
      <BackgroundImage source={backgroundImage}>
        {!image && <PlaceholderImage />}
      </BackgroundImage>
    </Container>
  )
}

export default SSICredentialLogo;
