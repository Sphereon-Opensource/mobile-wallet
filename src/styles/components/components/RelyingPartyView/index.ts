import {View} from 'react-native';
import styled from 'styled-components/native';
import {backgroundColors} from '@sphereon/ui-components.core';

type Props = {isTrusted: boolean}; // TODO move to types later in time

export const RelyingPartyViewContainerStyled = styled(View)<Props>`
  padding: 12px 16px;
  flex-direction: row;
  gap: 16px;
  background-color: ${backgroundColors.secondaryDark};
`;

export const RelyingPartyViewContentContainerStyled = styled(View)`
  flex: 1;
  gap: 12px;
`;
