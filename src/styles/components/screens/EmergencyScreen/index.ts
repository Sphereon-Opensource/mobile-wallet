import styled from 'styled-components/native';
import {backgroundColors} from '@sphereon/ui-components.core';

// FIXME add colors to ui-components once we merge this functionality
export const EmergencyScreenCountdownOuterContainerStyled = styled.View`
  width: 260px;
  height: 260px;
  background-color: #f25409;
  border-radius: 130px;
  align-items: center;
  justify-content: center;
  margin-top: 62px;
`;

// FIXME add colors to ui-components once we merge this functionality
export const EmergencyScreenCountdownMiddleContainerStyled = styled.View`
  width: 206px;
  height: 206px;
  background-color: #f78854;
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

// FIXME add to fonts when we want to merge this functionality
// FIXME vertical center workaround with padding
export const EmergencyScreenCountdownTextStyled = styled.Text`
  font-family: 'Poppins-Regular';
  font-size: 64px;
  font-weight: 600;
  padding-top: 14px;
  height: 64px;
  line-height: 64px;
`;
