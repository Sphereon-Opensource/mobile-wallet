import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {OnboardingHeaderContainerStyled as Container} from '../../../styles/components';
import {HeaderSecondaryBarRow} from './Row';

type Props = {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
};

export const HeaderSecondaryBar = ({left, right, center}: Props) => {
  return (
    <Container style={{paddingTop: useSafeAreaInsets().top}}>
      <HeaderSecondaryBarRow left={left} center={center} right={right} />
    </Container>
  );
};
