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
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 20px;
  background-color: transparent;
  padding: 0px 20px;
`;

export const ButtonContainer = styled(TitleContainer)`
  align-items: center;
  justify-content: center;
  gap: 10px;
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
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0px 0px 2px black;

  display: flex;
  align-items: stretch;

  background-color: white;
`;

export const IconContainer = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

export const ProgressRow = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10;
  margin-top: 10px;
`;

export const ProgressItem = styled.View`
  width: 10;
  height: 10;
  background-color: slategrey;
  border-radius: 5px;
`;

export const ProgressItemActive = styled(ProgressItem)`
  background-color: slateblue;
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
