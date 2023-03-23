import {BlurView} from '@react-native-community/blur';
import Ripple from 'react-native-material-ripple';
import styled from 'styled-components/native';

import {highlights} from '../../colors';
import {
  SSIBackgroundPrimaryDarkColorCss,
  SSIBackgroundPrimaryLightColorCss,
  SSIBackgroundSecondaryDarkColorCss,
  SSIButtonBottomContainerCss,
  SSIRoundedEdgesCss,
} from '../css';

export const SSIBasicContainerSecondaryStyled = styled.View`
  flex: 1;
  ${SSIBackgroundSecondaryDarkColorCss};
`;

// CONTAINERS (These should not contain any properties that changes the placement of the container e.g. margin. If you need specific properties, then extend the container element)
export const SSIFlexDirectionRowViewStyled = styled.View`
  flex-direction: row;
`;

export const SSIFlexDirectionColumnViewStyled = styled.View`
  flex-direction: column;
`;

export const SSIFullFlexDirectionRowViewStyled = styled(SSIFlexDirectionRowViewStyled)`
  flex: 1;
`;

export const SSIFlexDirectionColumnHalfViewStyled = styled(SSIFlexDirectionColumnViewStyled)`
  width: 45%;
`;

export const SSIBasicContainerStyled = styled.View`
  flex: 1;
  ${SSIBackgroundPrimaryDarkColorCss};
`;

export const SSIBasicModalContainerStyled = styled.View`
  flex: 1;
  background-color: 'rgba(16,16,16,0.5)';
`;

export const SSIBasicHorizontalCenterContainerStyled = styled(SSIBasicContainerStyled)`
  align-items: center;
`;

export const SSIRoundedContainerStyled = styled.View`
  ${SSIRoundedEdgesCss};
  overflow: hidden;
`;

export const SSIRoundedContainerBackgroundSecondaryDarkStyled = styled(SSIRoundedContainerStyled)`
  ${SSIRoundedEdgesCss};
  ${SSIBackgroundSecondaryDarkColorCss};
`;

export const SSIRoundedContainerBackgroundPrimaryLightStyled = styled(SSIRoundedContainerStyled)`
  ${SSIRoundedEdgesCss};
  ${SSIBackgroundPrimaryLightColorCss};
`;

export const SSIRippleContainerStyled = styled(Ripple).attrs({
  // TODO fix react-native-material-ripple package to start ripple effect on PressIn. Currently it only starts the effect when you release.
  // A fork was made to fix this (works) https://github.com/vjsingh/react-native-material-ripple
  // this commit fixes it https://github.com/vjsingh/react-native-material-ripple/commit/12e8f8d872ee780caa94e7de8080701e67dc6a9a

  // displayUntilPressOut: false, // TODO currently not implemented in latest version
  rippleSequential: false,
  rippleColor: highlights.dark,
  rippleCentered: true,
  rippleFades: false,
})``;

// TODO we should be able to merge these 2 justify-content: center;
export const SSIButtonBottomContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  ${SSIButtonBottomContainerCss};
`;

export const SSIRightColumnRightAlignedContainerStyled = styled(SSIFlexDirectionColumnViewStyled)`
  margin-left: auto;
`;

export const SSIBlurredContainerStyled = styled(BlurView).attrs({
  blurType: 'light',
  blurAmount: 3,
})`
  flex: 1;
  background-color: rgba(255, 255, 255, 0.25);
`;

export const SSIAlphaContainerStyled = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.2);
`;
