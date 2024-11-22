import React, {FC, useCallback, useEffect} from 'react';

import {useAccessibility} from '../../../hooks/useAccessibility';
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
  const titleRef = React.useRef(null);
  const {setFocus} = useAccessibility();
  const focusOnTitle = useCallback(() => setFocus(titleRef), [titleRef]);
  useEffect(focusOnTitle, []);

  return (
    <Container>
      <SideSpace />
      <ContentContainer>
        <TopContainer>
          <Title ref={titleRef}>{props.title}</Title>
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
