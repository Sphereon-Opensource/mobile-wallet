import {TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';

import {borderColors} from '@sphereon/ui-components.core';
import SSIIconButton from '../../../../components/buttons/SSIIconButton';
import {IHeaderProps} from '../../../../types';
import {SSIBackgroundPrimaryDarkColorCss} from '../../css';
import {SSITextH4LightStyled} from '../../fonts';

export const SSIHeaderBarContainerStyled = styled.View<IHeaderProps>`
  ${SSIBackgroundPrimaryDarkColorCss};
  border-bottom-color: ${borderColors.dark};
  border-bottom-width: ${({showBorder}) => (showBorder ? '1px' : '0')};
  padding-right: 24px;
  padding-left: 24px;
`;

export const SSIHeaderBarHeaderSubCaptionStyled = styled(SSITextH4LightStyled)`
  margin-bottom: 14px;
  font-size: 16px;
`;

export const SSIHeaderBarProfileIconContainerStyled = styled(TouchableOpacity)`
  margin: 7px 0 15px auto;
`;

// TODO move height to attributes of SSIIconButton
export const SSIHeaderBarMoreIconStyled = styled(SSIIconButton)`
  margin-top: 2px;
  margin-left: auto;
  height: 36px;
  justify-content: center;
`;

export const SSIHeaderBarBackIconContainerStyled = styled.View`
  width: 50px;
`;

// TODO move width to attributes of SSIIconButton
export const SSIHeaderBarBackIconStyled = styled(SSIIconButton)`
  margin-top: 18px;
`;

export const SSIHeaderBarMoreMenuContainerStyled = styled.View`
  position: absolute;
  width: 220px;
  right: -14px;
  top: 92px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
`;

// we need this zIndex as the logout button is displayed over the more button and without it, when you press the logout button on the exact place where the more button is, the more button would also be triggered
export const SSIHeaderBarProfileMenuContainerStyled = styled.View`
  position: absolute;
  width: 220px;
  right: -14px;
  top: 46px;
  z-index: 1000;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
`;
