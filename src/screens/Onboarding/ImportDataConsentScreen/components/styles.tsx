import styled from 'styled-components/native';
import {SSITextH3Styled, SSITextH5LightStyled} from '../../../../styles/components';
import {Text} from '../../components/styles';

export const ProviderLabel = styled.Text`
  color: white;
  font-weight: 600;
  font-size: 14px;
  width: 100%;
  text-align: left;
`;

export const SectionLabel = styled(ProviderLabel)``;

export const ProviderTitle = SSITextH3Styled;

export const SubTitle = styled(Text)`
  margin-bottom: 24px;
`;

export const ProviderContainer = styled.View`
  display: flex;
  flex-direction: row;
  padding: 16px;
  gap: 16px;
  border: 1px solid #5d6990;
  border-radius: 8px;
  margin-top: 10px;
  margin-bottom: 24px;
  width: 100%;
  align-items: center;
`;

export const RequestedInformationContainer = styled.View`
  border: 1px solid #5d6990;
  border-radius: 8px;
  background-color: #2c334b;
  padding: 12px;
  padding-bottom: 0px;
  gap: 8px;
  width: 100%;
`;

export const RequestedInformationRow = styled.View`
  flex-direction: row;
  padding: 0px;
  align-items: center;
  gap: 8px;
`;

export const RequestedInformationDescriptionContainer = styled.View`
  display: flex;
  flex-direction: column;
`;

export const RequestedInformationLabel = styled.Text`
  color: lightgrey;
  font-size: 11px;
  font-weight: 400;
`;

export const RequestedInformationValue = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: 400;
`;

export const ProviderImage = styled.Image`
  width: 48px;
  height: 48px;
`;

export const ProviderUrl = styled(SSITextH5LightStyled)`
  margin-top: 6px;
`;

export const ProviderDescription = styled.View`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const ProviderCardRow = styled.View`
  flex-direction: row;
  gap: 16px;
  margin-top: 10px;
  margin-bottom: 24px;
  align-items: center;
  gap: 16px;
`;

export const ProviderMiniCardImage = styled.View`
  display: flex;
  padding: 12px 24px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  background-color: white;
`;

export const InformationIconContainer = styled.View`
  display: flex;
  padding: 16px;
`;

export const InformationIcon = styled.Image`
  width: 30px;
  height: 30px;
`;
