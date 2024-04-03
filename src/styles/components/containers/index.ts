import {BlurView} from '@react-native-community/blur';
import {TouchableHighlight} from 'react-native';
import styled from 'styled-components/native';

import {
  SSIBackgroundPrimaryDarkColorCss,
  SSIBackgroundPrimaryLightColorCss,
  SSIBackgroundSecondaryDarkColorCss,
  SSIButtonBottomContainerCss,
  SSIRoundedEdgesCss,
} from '../css';
import {elementColors} from '@sphereon/ui-components.core';

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

export const SSIRippleContainerStyled = styled(TouchableHighlight).attrs({
  underlayColor: elementColors.purple,
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

export const SSIFullHeightScrollViewContainer = styled.ScrollView.attrs({
  contentContainerStyle: {flexGrow: 1},
  keyboardShouldPersistTaps: 'handled',
})`
  flex: 1;
  width: 100%;
`;
