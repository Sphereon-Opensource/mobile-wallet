import {styled} from 'styled-components/native';

export const Container = styled.View`
  position: relative;
  flex: 1;
  display: flex;
  background-color: #202537;
  align-items: stretch;
  justify-content: flex-start;
  padding-bottom: 20px;
`;

export const Text = styled.Text`
  color: white;
  font-size: 18px;
  line-height: 24px;
`;

export const Title = styled(Text)`
  font-size: 24px;
  font-weight: 600;
  line-height: 36px;
  margin-bottom: 8px;
`;

export const TitleContainer = styled.View`
  display: flex;
  align-items: stretch;
  padding: 10px 20px;
`;

export const ContentContainer = styled.Pressable`
  margin-top: 20px;
  flex: 1;
  align-items: center;
  background-color: transparent;
`;

export const ModalTitle = styled(Text)`
  font-size: 16px;
  color: slategray;
  text-align: center;
`;

export const ModalText = styled(Text)`
  color: darkgray;
  font-size: 12px;
  text-align: center;
  margin-bottom: 10px;
`;

export const ModalCard = styled.View`
  padding: 30px 36px;
  border-radius: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  background-color: white;
`;

export const IconContainer = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;

export const ProgressRow = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
`;

export const ProgressItem = styled.View`
  width: 10px;
  height: 10px;
  background-color: #98a3ae;
  border-radius: 5px;
`;

export const ProgressItemActive = styled(ProgressItem)`
  background-color: #2707f8;
`;

export const DataLoadingIndicator = styled.Image`
  height: 80px;
  width: 80px;
`;

export const DataLoadingScreenHeading = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
`;

export const DataLoadingScreenSubHeading = styled.Text`
  color: white;
  font-size: 12px;
`;
