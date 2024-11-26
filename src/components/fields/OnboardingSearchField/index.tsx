import {backgroundColors} from '@sphereon/ui-components.core';
import React from 'react';
import {TextInputProps, ViewStyle} from 'react-native';
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

export type Props = TextInputProps & {
  onClear?: () => void;
  containerStyle?: ViewStyle;
};

const OnboardingSearchField = ({onClear, containerStyle = {}, ...inputProps}: Props) => (
  <Container accessibilityRole="search" style={containerStyle} importantForAccessibility="no">
    <SSIIconButton
      icon={ButtonIconsEnum.SEARCH}
      iconColor={backgroundColors.primaryLight}
      iconSize={32}
      disabled
      onPress={() => {}}
      importantForAccessibility="no"
    />
    <StyledSearchField placeholder="Search" {...inputProps} />
    {inputProps.value && onClear && (
      <SSIIconButton
        accessibilityRole="button"
        accessibilityLabel="Clear search"
        style={{marginLeft: 'auto', padding: 8}}
        icon={ButtonIconsEnum.CLOSE}
        iconColor={backgroundColors.primaryLight}
        iconSize={12}
        onPress={onClear}
      />
    )}
  </Container>
);

export default OnboardingSearchField;
