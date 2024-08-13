import {ScrollView} from 'react-native';
import {Text} from '../../components/styles';
import styled from 'styled-components/native';

export const ScrollableContent = styled(ScrollView)`
  flex: 1;
`;

export const ProviderLabel = styled.Text`
  color: white;
  font-weight: 600;
  font-size: 14px;
  width: 100%;
  text-align: left;
`;

export const SectionLabel = styled(ProviderLabel)``;

export const ProviderTitle = styled(ProviderLabel)`
  margin-bottom: 0px;
`;

export const SubTitle = styled(Text)`
  margin-bottom: 24px;
`;

export const ProviderContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 20px;

  gap: 5px;

  border: 1px solid #5d6990;
  border-radius: 8px;

  margin-top: 10px;
  margin-bottom: 24px;

  width: 100%;
`;

export const RequestedInformationContainer = styled(ProviderContainer)`
  background-color: #2c334b;
  flex-direction: column;
  padding: 24px;
  gap: 15px;
`;

export const RequestedInformationRow = styled.View`
  display: flex;
  flex-direction: row;
  padding: 5px 0px;
  align-items: center;
  gap: 10px;
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

export const ProviderText = styled.Text`
  color: white;
  font-size: 12px;
`;

export const ProviderImageContainer = styled.View`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ProviderImage = styled.Image`
  width: 30px;
  height: 30px;
`;

export const ProviderUrl = styled(ProviderText)`
  margin-top: 6px;
`;

export const ProviderDescription = styled.View`
  flex: 4;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 5px;
`;

export const ProviderCardRow = styled(ProviderContainer)`
  border-width: 0;
  padding: 0px 0px 0px 0px;
  gap: 12px;
  display: flex;
  align-items: stretch;
`;

export const ProviderMiniCardImage = styled.View`
  width: 60px;
  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 10px;
  background-color: white;
  padding: 10px 50px;
`;

export const InformationIconContainer = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 10px;
`;

export const InformationIcon = styled.Image`
  width: 30px;
  height: 30px;
`;
