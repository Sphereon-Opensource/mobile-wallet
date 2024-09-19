import {backgroundColors} from '@sphereon/ui-components.core';
import {
  SSITextH1SemiBoldStyled,
  SSITextH2SemiBoldStyled,
  SSITextH3LightStyled,
  SSITextH3SemiBoldStyled,
  SSITextH4LightStyled,
  SSITextH4SemiBoldStyled,
} from '@sphereon/ui-components.ssi-react-native';
import {Dimensions} from 'react-native';
import {styled} from 'styled-components/native';

export const SettingsScreenContainer = styled.SafeAreaView`
  display: flex;
  align-items: stretch;
  flex: 1;
  background-color: ${backgroundColors.primaryDark};
`;

export const Content = styled.View`
  flex: 1;
  display: flex;
  background-color: ${backgroundColors.primaryDark};
  align-items: stretch;
  justify-content: flex-start;
`;

export const Text = styled.Text`
  color: white;
  font-size: 16px;
`;

export const SettingsHeaderContainer = styled.View`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 60px;
`;

export const SettingsHeaderText = styled(SSITextH1SemiBoldStyled)`
  width: 100%;
  text-align: center;
  color: white;
`;

export const BackIconContainer = styled.Pressable`
  position: absolute;
  left: 20px;
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

export const SettingsSection = styled.View`
  background-color: #2c334b;
  padding: 10px 24px;
  margin-bottom: 18px;
`;

export const SectionTitle = styled(SSITextH2SemiBoldStyled)`
  padding: 0px 24px;
  color: white;
`;

export const NavigationItemRow = styled.Pressable`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin: 10px;
`;

export const NavigationItemRowText = styled(SSITextH3SemiBoldStyled)`
  color: white;
`;

export const NavigationIconContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const UserName = styled(SSITextH2SemiBoldStyled)`
  color: white;
`;

export const MenuItemRow = styled.Pressable`
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  padding: 10px 0px;
  margin: 5px 0px;
`;

export const MenuItemText = styled(SSITextH3LightStyled)`
  color: white;
`;

export const Divider = styled.View`
  width: 100%;
  border: 0.7px solid #404d7a;
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

export const AccountUserInfoContainer = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 24px;
`;

export const AccountUserInfoName = styled(SSITextH4SemiBoldStyled)`
  color: white;
`;

export const AccountType = styled(SSITextH4LightStyled)`
  color: white;
`;
