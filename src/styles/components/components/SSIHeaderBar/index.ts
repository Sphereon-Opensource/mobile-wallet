import {TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';

import SSIIconButton from '../../../../components/buttons/SSIIconButton';
import {IHeaderProps} from '../../../../types';
import {SSIBackgroundPrimaryDarkColorCss} from '../../css';
import {SSITextH4LightStyled} from '../../fonts';
import {borderColors} from '@sphereon/ui-components.core';

export const SSIHeaderBarContainerStyled = styled.View`
  ${SSIBackgroundPrimaryDarkColorCss};
  border-bottom-color: ${borderColors.dark};
  border-bottom-width: ${(props: IHeaderProps) => (props.showBorder ? '1px' : '0px')};
  padding-right: 24px;
  padding-left: 24px;
`;

export const SSIHeaderBarHeaderSubCaptionStyled = styled(SSITextH4LightStyled)`
  margin-bottom: 14px;
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
  width: 20px;
`;

export const SSIHeaderBarMoreMenuContainerStyled = styled.View`
  position: absolute;
  width: 250px;
  right: -14px;
  top: 92px;
`;

// we need this zIndex as the logout button is displayed over the more button and without it, when you press the logout button on the exact place where the more button is, the more button would also be triggered
export const SSIHeaderBarProfileMenuContainerStyled = styled.View`
  position: absolute;
  width: 250px;
  right: -14px;
  top: 46px;
  z-index: 1000;
`;
