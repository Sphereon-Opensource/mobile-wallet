import {styled} from 'styled-components/native';
import {SSIBasicContainerSecondaryStyled as SSIContainer} from '../../../../styles/components';
import {backgroundColors} from '@sphereon/ui-components.core';

export const Container = styled(SSIContainer)`
  background-color: ${backgroundColors.primaryDark};
`;

export const ContactDetailsHeaderSection = styled.View`
  margin-top: 20px;
  padding: 0px 5px;
  display: flex;
  align-items: stretch;
  margin-bottom: 20px;
`;

export const ContactDetailsNavigationSection = styled.View`
  display: flex;
  align-items: stretch;
  padding-horizontal: 16px;
`;

export const Divider = styled.View`
  height: 1px;
  background-color: #404d7a;
  width: 100%;
`;
