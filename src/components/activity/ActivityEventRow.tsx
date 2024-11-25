import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {ForwardedRef, forwardRef} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {SSITextH2SemiBoldLightStyled, SSITextH4LightStyled} from '../../styles/components';
import {formatDateTime} from '../../utils';
import ChevronIcon from '../assets/icons/ChevronIcon';

export type RowProps = {
  title: string;
  actionDescription: string;
  actionIcon: React.ReactNode;
  subtitle?: string;
  date: Date;
  index: number;
  onPress: () => void;
};

const Container = styled.TouchableOpacity`
  padding: 16px 24px;
  flex-direction: row;
  align-items: center;
  min-height: 100px;
`;

const Description = styled.View`
  flex-direction: row;
  align-items: center;
  margin-vertical: 8px;
  gap: 8px;
`;

export const ActivityEventRow = forwardRef(
  (p: RowProps, _: ForwardedRef<unknown>): JSX.Element => (
    <Container
      accessible
      onPress={p.onPress}
      accessibilityHint="See more about this activity"
      style={{backgroundColor: backgroundColors[p.index % 2 === 0 ? 'primaryDark' : 'secondaryDark']}}>
      <View style={{flex: 1}}>
        <SSITextH2SemiBoldLightStyled>{p.title}</SSITextH2SemiBoldLightStyled>
        {p.subtitle && <SSITextH4LightStyled>{p.subtitle}</SSITextH4LightStyled>}
        <Description>
          {p.actionIcon}
          <SSITextH4LightStyled>{p.actionDescription}</SSITextH4LightStyled>
        </Description>
        <SSITextH4LightStyled>{formatDateTime(p.date, 'DD-MMM-YYYY HH:mm')}</SSITextH4LightStyled>
      </View>
      <ChevronIcon size={16} color={fontColors.light} style={{transform: [{rotate: '-90deg'}]}} />
    </Container>
  ),
);
