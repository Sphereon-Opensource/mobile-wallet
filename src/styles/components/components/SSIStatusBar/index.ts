import {RefAttributes} from 'react';
import {StatusBar, StatusBarProps} from 'react-native';
import {ThemedStyledProps} from 'styled-components';
import styled from 'styled-components/native';
import {backgroundColors} from '@sphereon/ui-components.core';

export const SSIStatusBarDarkModeStyled = styled(StatusBar).attrs((props: ThemedStyledProps<StatusBarProps & RefAttributes<StatusBar>, any>) => ({
  backgroundColor: props.backgroundColor || backgroundColors.primaryDark,
}))``;
