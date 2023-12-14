import {LinearGradient} from 'expo-linear-gradient';
import {LinearTextGradient} from 'react-native-text-gradient';
import styled from 'styled-components/native';

import {backgrounds, highLightGradients} from '../../colors';
import {SSIRoundedEdgesCss} from '../css';
import {StatusBar, StatusBarProps} from 'react-native';
import {ThemedStyledProps} from 'styled-components';
import {RefAttributes} from 'react';

// export const SSILinearGradientStyled = styled(LinearGradient).attrs({
//   //colors: props?.colors ?? [highLightGradients['100'].secondaryColor, highLightGradients['100'].primaryColor],
//   start: {x: 1, y: 1},
//   end: {x: 0, y: 0},
// })``;

export const SSILinearGradientStyled = styled(LinearGradient).attrs(props => ({
  colors: props?.colors ?? [highLightGradients['100'].secondaryColor, highLightGradients['100'].primaryColor],
  start: {x: 1, y: 1},
  end: {x: 0, y: 0},
}))``;

export const SSILinearGradientSecondaryStyled = styled(LinearGradient).attrs({
  colors: [highLightGradients['200'].secondaryColor, highLightGradients['200'].primaryColor],
  start: {x: 1, y: 1},
  end: {x: 0, y: 0},
})``;

export const SSIRoundedLinearGradient = styled(SSILinearGradientStyled)`
  ${SSIRoundedEdgesCss}
`;

export const SSITextFieldLinearTextGradientStyled = styled(LinearTextGradient).attrs({
  locations: [0, 1],
  colors: [highLightGradients['100'].secondaryColor, highLightGradients['100'].primaryColor],
  start: {x: 1, y: 1},
  end: {x: 0, y: 0},
})``;
