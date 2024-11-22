import {fontColors} from '@sphereon/ui-components.core';
import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {SSIHeaderBarBackIconStyled as BackIcon, SSITextH3LightStyled, SSITextH4Styled} from '../../styles/components';
import {ButtonIconsEnum} from '../../types';

export const Back = ({onPress}: {onPress: () => void}) => (
  <BackIcon
    style={{
      width: 36,
      height: 42,
      marginTop: 0,
      justifyContent: 'center',
    }}
    icon={ButtonIconsEnum.BACK}
    onPress={onPress}
  />
);

export const Title = SSITextH3LightStyled;

export const Subtitle = styled(SSITextH4Styled)`
  color: ${fontColors.greyedOut};
`;

export const CenterInfo = ({title, subtitle}: {title: string; subtitle?: string}) => (
  <View style={{alignItems: 'center'}}>
    <Title>{title}</Title>
    {subtitle && <Subtitle>{subtitle}</Subtitle>}
  </View>
);
