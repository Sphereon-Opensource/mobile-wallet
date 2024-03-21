import {LinearGradient} from 'expo-linear-gradient';
import {LinearGradientText} from 'react-native-linear-gradient-text';
import styled from 'styled-components/native';

import {SSIRoundedEdgesCss} from '../css';
import {gradientsColors} from '@sphereon/ui-components.core';

export const SSILinearGradientStyled = styled(LinearGradient).attrs(props => ({
  colors: props?.colors ?? [gradientsColors['100'].secondaryColor, gradientsColors['100'].primaryColor],
  start: {x: 1, y: 1},
  end: {x: 0, y: 0},
}))``;

export const SSILinearGradientSecondaryStyled = styled(LinearGradient).attrs({
  colors: [gradientsColors['200'].secondaryColor, gradientsColors['200'].primaryColor],
  start: {x: 1, y: 1},
  end: {x: 0, y: 0},
})``;

export const SSIRoundedLinearGradient = styled(SSILinearGradientStyled)`
  ${SSIRoundedEdgesCss}
`;

export const SSITextFieldLinearTextGradientStyled = styled(LinearGradientText).attrs({
  locations: [0, 1],
  colors: [gradientsColors['100'].secondaryColor, gradientsColors['100'].primaryColor],
  start: {x: 1, y: 1},
  end: {x: 0, y: 0},
})``;
