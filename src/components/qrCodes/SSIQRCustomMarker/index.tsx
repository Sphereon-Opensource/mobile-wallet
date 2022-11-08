import React, { FC } from 'react'

import {
  SSIQRReaderBottomContainerStyled as BottomContainer,
  SSIFullFlexDirectionRowViewStyled as Container,
  SSIQRReaderContentContainer as ContentContainer,
  SSIQRReaderMarkerStyled as Marker,
  SSIQRReaderSideSpaceStyled as SideSpace,
  SSITextH4LightStyled as SubTitle,
  SSITextH1LightStyled as Title,
  SSIQRReaderTopContainerStyled as TopContainer
} from '../../../styles/styledComponents'

export interface IProps {
  title: string
  subtitle: string
}

const SSIQRCustomMarker: FC<IProps> = (props: IProps): JSX.Element => {
  return (
    <Container>
      <SideSpace />
      <ContentContainer>
        <TopContainer>
          <Title>{props.title}</Title>
          <SubTitle>{props.subtitle}</SubTitle>
        </TopContainer>
        <Marker />
        <BottomContainer />
      </ContentContainer>
      <SideSpace />
    </Container>
  )
}

export default SSIQRCustomMarker
