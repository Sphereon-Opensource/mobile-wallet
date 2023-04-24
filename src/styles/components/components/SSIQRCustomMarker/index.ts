import {Dimensions} from 'react-native';
import styled from 'styled-components/native';

const dimensions = Dimensions.get('window');

export const SSIQRCustomMarkerSideSpaceStyled = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.44);
`;

// TODO move color to color file
// TODO https://sphereon.atlassian.net/browse/WAL-542 (for making qr code marker rounded)
export const SSIQRCustomMarkerStyled = styled.View`
  width: ${dimensions.width * 0.8}px;
  height: ${dimensions.width * 0.8}px;
  border-color: #2a3046;
  border-width: 2px;
`;

export const SSIQRCustomMarkerBottomContainerStyled = styled.View`
  flex-grow: 3;
  background-color: rgba(0, 0, 0, 0.44);
`;

export const SSIQRCustomMarkerTopContainerStyled = styled.View`
  flex-grow: 2;
  background-color: rgba(0, 0, 0, 0.44);
  justify-content: flex-end;
  padding-bottom: 32px;
`;

export const SSIQRCustomMarkerContentContainer = styled.View`
  flex-grow: 2;
  max-width: 80%;
`;
