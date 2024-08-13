import {backgroundColors} from '@sphereon/ui-components.core';
import React from 'react';
import {TextInputProps} from 'react-native';
import styled from 'styled-components/native';
import SSIIconButton from '../../../components/buttons/SSIIconButton';
import {TextInputStyled} from '../../../styles/components';
import {ButtonIconsEnum} from '../../../types';

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 4px;
  border-width: 1px;
  border-color: ${backgroundColors.primaryLight};
`;

const StyledSearchField = styled(TextInputStyled)`
  color: ${backgroundColors.primaryLight};
  padding: 8px;
  flex: 1;
`;

const OnboardingSearchField = (props: TextInputProps) => (
  <Container>
    <SSIIconButton icon={ButtonIconsEnum.SEARCH} iconColor={backgroundColors.primaryLight} iconSize={32} disabled onPress={() => { }} />
    <StyledSearchField placeholder="Search" {...props} />
  </Container>
);

export default OnboardingSearchField;