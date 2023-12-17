import {Animated} from 'react-native';
import styled from 'styled-components/native';

import {fontStyle} from '../../typography';
import {fontColors} from '@sphereon/ui-components.core';

export const SSITextH0Styled = styled.Text`
  font-family: ${fontStyle.h0SemiBold.fontFamily};
  font-size: ${fontStyle.h0SemiBold.fontSize}px;
  font-weight: ${fontStyle.h0SemiBold.fontWeight};
  line-height: ${fontStyle.h0SemiBold.lineHeight}px;
  height: auto;
`;

export const SSITextH0LightStyled = styled(SSITextH0Styled)`
  color: ${fontColors.light};
`;

export const SSITextH1Styled = styled.Text`
  font-family: ${fontStyle.h1SemiBold.fontFamily};
  font-size: ${fontStyle.h1SemiBold.fontSize}px;
  font-weight: ${fontStyle.h1SemiBold.fontWeight};
  line-height: ${fontStyle.h1SemiBold.lineHeight}px;
  height: auto;
`;

export const SSITextH1LightStyled = styled(SSITextH1Styled)`
  color: ${fontColors.light};
`;

export const SSITextH2Styled = styled.Text`
  font-family: ${fontStyle.h2Regular.fontFamily};
  font-size: ${fontStyle.h2Regular.fontSize}px;
  font-weight: ${fontStyle.h2Regular.fontWeight};
  line-height: ${fontStyle.h2Regular.lineHeight}px;
  height: auto;
`;

export const SSITextH2SemiBoldStyled = styled.Text`
  font-family: ${fontStyle.h2SemiBold.fontFamily};
  font-size: ${fontStyle.h2SemiBold.fontSize}px;
  font-weight: ${fontStyle.h2SemiBold.fontWeight};
  line-height: ${fontStyle.h2SemiBold.lineHeight}px;
  height: auto;
`;

export const SSITextH2SemiBoldLightStyled = styled(SSITextH2SemiBoldStyled)`
  color: ${fontColors.light};
`;

export const SSITextH2LightStyled = styled(SSITextH2Styled)`
  color: ${fontColors.light};
`;

export const SSITextH2DarkStyled = styled(SSITextH2Styled)`
  color: ${fontColors.dark};
`;

export const SSITextH2SecondaryButtonStyled = styled(SSITextH2Styled)`
  color: ${fontColors.secondaryButton};
`;

export const SSITextH3RegularStyled = styled.Text`
  font-family: ${fontStyle.h3Regular.fontFamily};
  font-size: ${fontStyle.h3Regular.fontSize}px;
  font-weight: ${fontStyle.h3Regular.fontWeight};
  line-height: ${fontStyle.h3Regular.lineHeight}px;
  height: auto;
`;

export const SSITextH3RegularLightStyled = styled(SSITextH3RegularStyled)`
  color: ${fontColors.light};
`;

// TODO name semibold
export const SSITextH3Styled = styled.Text`
  font-family: ${fontStyle.h3SemiBold.fontFamily};
  font-size: ${fontStyle.h3SemiBold.fontSize}px;
  font-weight: ${fontStyle.h3SemiBold.fontWeight};
  line-height: ${fontStyle.h3SemiBold.lineHeight}px;
  height: auto;
`;

export const SSITextH3LightStyled = styled(SSITextH3Styled)`
  color: ${fontColors.light};
`;

export const SSITextH3AnimatedStyled = styled(Animated.Text)`
  font-family: ${fontStyle.h3SemiBold.fontFamily};
  font-size: ${fontStyle.h3SemiBold.fontSize}px;
  font-weight: ${fontStyle.h3SemiBold.fontWeight};
  line-height: ${fontStyle.h3SemiBold.lineHeight}px;
  height: auto;
`;

export const SSITextH3AnimatedLightStyled = styled(SSITextH3AnimatedStyled)`
  color: ${fontColors.light};
`;

export const SSITextH4Styled = styled.Text`
  font-family: ${fontStyle.h4Regular.fontFamily};
  font-size: ${fontStyle.h4Regular.fontSize}px;
  font-weight: ${fontStyle.h4Regular.fontWeight};
  line-height: ${fontStyle.h4Regular.lineHeight}px;
  height: auto;
`;

export const SSITextH4SemiBoldStyled = styled.Text`
  font-family: ${fontStyle.h4SemiBold.fontFamily};
  font-size: ${fontStyle.h4SemiBold.fontSize}px;
  font-weight: ${fontStyle.h4SemiBold.fontWeight};
  line-height: ${fontStyle.h4SemiBold.lineHeight}px;
  height: auto;
`;

export const SSITextH4LightStyled = styled(SSITextH4Styled)`
  color: ${fontColors.light};
`;

export const SSITextH4DarkStyled = styled(SSITextH4Styled)`
  color: ${fontColors.dark};
`;

export const SSITextH4SemiBoldLightStyled = styled(SSITextH4SemiBoldStyled)`
  color: ${fontColors.light};
`;

export const SSITextH5Styled = styled.Text`
  font-family: ${fontStyle.h5Regular.fontFamily};
  font-size: ${fontStyle.h5Regular.fontSize}px;
  font-weight: ${fontStyle.h5Regular.fontWeight};
  line-height: ${fontStyle.h5Regular.lineHeight}px;
  height: auto;
`;

export const SSITextH5LightStyled = styled(SSITextH5Styled)`
  color: ${fontColors.light};
`;

export const SSITextH5SemiBoldStyled = styled.Text`
  font-family: ${fontStyle.h5SemiBold.fontFamily};
  font-size: ${fontStyle.h5SemiBold.fontSize}px;
  font-weight: ${fontStyle.h5SemiBold.fontWeight};
  line-height: ${fontStyle.h5SemiBold.lineHeight}px;
  height: auto;
`;

export const SSITextH5LightSemiBoldStyled = styled(SSITextH5SemiBoldStyled)`
  color: ${fontColors.light};
`;

export const SSITextH6Styled = styled.Text`
  font-family: ${fontStyle.h6.fontFamily};
  font-size: ${fontStyle.h6.fontSize}px;
  font-weight: ${fontStyle.h6.fontWeight};
  line-height: ${fontStyle.h6.lineHeight}px;
  height: auto;
`;

export const SSITextH6LightStyled = styled(SSITextH6Styled)`
  color: ${fontColors.light};
`;

export const SSITextH7SemiBoldStyled = styled.Text`
  font-family: ${fontStyle.h7SemiBold.fontFamily};
  font-size: ${fontStyle.h7SemiBold.fontSize}px;
  font-weight: ${fontStyle.h7SemiBold.fontWeight};
  line-height: ${fontStyle.h7SemiBold.lineHeight}px;
  height: auto;
`;

export const SSITextH7SemiBoldLightStyled = styled(SSITextH7SemiBoldStyled)`
  color: ${fontColors.light};
`;
