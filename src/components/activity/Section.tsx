import {fontColors} from '@sphereon/ui-components.core';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {SSITextH3LightStyled, SSITextH4LightStyled} from '../../styles/components';

export const Section = ({title, children}: {title: string; children: React.ReactNode}) => (
  <View style={{gap: 8}}>
    <SSITextH3LightStyled accessibilityRole="header" style={{marginHorizontal: 8}}>
      {title}
    </SSITextH3LightStyled>
    {children}
  </View>
);

export const SectionText = styled(SSITextH4LightStyled)`
  color: ${fontColors.light};
  opacity: 0.8;
  margin-horizontal: 8px;
`;
