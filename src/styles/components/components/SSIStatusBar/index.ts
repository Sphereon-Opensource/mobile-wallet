import {StatusBar} from 'react-native';
import styled from 'styled-components/native';
import {backgroundColors} from '@sphereon/ui-components.core';

export const SSIStatusBarDarkModeStyled = styled(StatusBar).attrs((props: any) => ({
  backgroundColor: props.backgroundColor || backgroundColors.primaryDark,
}))``;
