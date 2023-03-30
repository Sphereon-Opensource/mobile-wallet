import React, {FC} from 'react';

import {
  SSIQRCustomMarkerBottomContainerStyled as BottomContainer,
  SSIFullFlexDirectionRowViewStyled as Container,
  SSIQRCustomMarkerContentContainer as ContentContainer,
  SSIQRCustomMarkerStyled as Marker,
  SSIQRCustomMarkerSideSpaceStyled as SideSpace,
  SSITextH4LightStyled as SubTitle,
  SSITextH1LightStyled as Title,
  SSIQRCustomMarkerTopContainerStyled as TopContainer,
} from '../../../styles/components';

export interface IProps {
  title: string;
  subtitle: string;
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
  );
};

export default SSIQRCustomMarker;
