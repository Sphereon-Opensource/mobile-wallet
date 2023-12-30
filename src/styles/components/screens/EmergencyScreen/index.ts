import styled from 'styled-components/native';
import {backgroundColors, elementColors} from '@sphereon/ui-components.core';
import {SSIBasicHorizontalCenterContainerStyled} from '../../containers';
import {Text64Styled} from '@sphereon/ui-components.ssi-react-native';

export const EmergencyScreenContainerStyled = styled(SSIBasicHorizontalCenterContainerStyled)`
  background-color: ${backgroundColors.orange};
`;

export const EmergencyScreenCountdownOuterContainerStyled = styled.View`
  width: 260px;
  height: 260px;
  background-color: ${elementColors['100']};
  border-radius: 130px;
  align-items: center;
  justify-content: center;
  margin-top: 62px;
`;

export const EmergencyScreenCountdownMiddleContainerStyled = styled.View`
  width: 206px;
  height: 206px;
  background-color: ${elementColors['200']};
  border-radius: 103px;
  align-items: center;
  justify-content: center;
`;

export const EmergencyScreenCountdownInnerContainerStyled = styled.View`
  width: 150px;
  height: 150px;
  background-color: ${backgroundColors.primaryLight};
  border-radius: 75px;
  align-items: center;
  justify-content: center;
`;

export const EmergencyScreenButtonContainerStyled = styled.View`
  gap: 20px;
  margin-bottom: 60px;
  margin-top: auto;
`;

// FIXME vertical center workaround with padding
export const EmergencyScreenCountdownTextStyled = styled(Text64Styled)`
  padding-top: 14px;
`;
//height: 64px;
