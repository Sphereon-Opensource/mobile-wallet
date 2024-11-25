import styled from 'styled-components/native';
import {OnboardingHeaderRow as HeaderRow} from '../../../styles/components';

type Props = {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
};

const ItemContainer = styled.View`
  justify-content: center;
`;

const LeftContainer = styled(ItemContainer)`
  margin-right: auto;
`;

const CenterContainer = styled(ItemContainer)`
  align-items: center;
  position: absolute;
  height: 100%;
  left: 0;
  top: 0;
  width: 100%;
  padding-horizontal: 48px;
  flex: 1;
  pointer-events: none;
`;

const RightContainer = styled(ItemContainer)`
  margin-left: auto;
`;

export const HeaderSecondaryBarRow = ({left, center, right}: Props) => (
  <HeaderRow>
    <LeftContainer>{left}</LeftContainer>
    <CenterContainer>{center}</CenterContainer>
    <RightContainer>{right}</RightContainer>
  </HeaderRow>
);
