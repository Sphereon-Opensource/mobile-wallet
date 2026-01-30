import {gradientsColors} from '@sphereon/ui-components.core';
import {LinearGradient, LinearGradientProps} from 'expo-linear-gradient';
import {LinearGradientText} from 'react-native-linear-gradient-text';
import React from 'react';
import styled from 'styled-components/native';
import {SSIRoundedEdgesCss} from '../css';

// Cast LinearGradient to make colors optional since it's provided via attrs
const LinearGradientWithOptionalColors = LinearGradient as unknown as React.ComponentType<Omit<LinearGradientProps, 'colors'> & {colors?: string[]}>;

export const SSILinearGradientStyled = styled(LinearGradientWithOptionalColors).attrs(props => ({
  colors: props?.colors ?? [gradientsColors['100'].secondaryColor, gradientsColors['100'].primaryColor],
  start: {x: 1, y: 1},
  end: {x: 0, y: 0},
}))``;

export const SSILinearGradientSecondaryStyled = styled(LinearGradientWithOptionalColors).attrs({
  colors: [gradientsColors['200'].secondaryColor, gradientsColors['200'].primaryColor],
  start: {x: 1, y: 1},
  end: {x: 0, y: 0},
})``;

export const SSIRoundedLinearGradient = styled(SSILinearGradientStyled)`
  ${SSIRoundedEdgesCss}
`;

const LinearGradientTextWithOptionalColors = LinearGradientText as React.FC<Omit<React.ComponentProps<typeof LinearGradientText>, 'colors'> & {colors?: string[]}>;

export const SSITextFieldLinearTextGradientStyled = styled(LinearGradientTextWithOptionalColors).attrs({
  locations: [0, 1],
  colors: [gradientsColors['100'].secondaryColor, gradientsColors['100'].primaryColor],
  start: {x: 1, y: 1},
  end: {x: 0, y: 0},
})``;
