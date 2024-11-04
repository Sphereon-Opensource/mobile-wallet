import {styled} from 'styled-components/native';

export const VerifiedLabelContainer = styled.View`
  padding: 0px 10px 0px 0px;
  border: 1px solid green;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 4px;
  align-self: flex-start;
  border-radius: 10px;
`;

export const VerifiedLabelIconContainer = styled.View`
  background-color: #00c249;
  aspect-ratio: 1;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const VerifiedLabelText = styled.Text`
  color: #00c249;
  font-size: 10px;
  align-self: center;
`;
