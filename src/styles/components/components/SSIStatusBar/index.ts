import {RefAttributes} from 'react';
import {StatusBar, StatusBarProps} from 'react-native';
import {ThemedStyledProps} from 'styled-components';
import styled from 'styled-components/native';
import {backgrounds} from '../../../colors';

export const SSIStatusBarDarkModeStyled = styled(StatusBar).attrs((props: ThemedStyledProps<StatusBarProps & RefAttributes<StatusBar>, any>) => ({
  backgroundColor: props.backgroundColor || backgrounds.primaryDark,
}))``;
