import {ParamListBase, useNavigation} from '@react-navigation/native';
import {SettingsHeaderBar} from '../components/SettingsHeaderBar';
import {
  Content,
  Divider,
  MenuItemRow,
  MenuItemText,
  NavigationItemRow,
  NavigationItemRowText,
  SectionTitle,
  SettingsScreenContainer,
  SettingsSection,
  UserName,
} from '../components/style';
import {translate} from '../../../localization/Localization';
import ChevronIcon from '../../../components/assets/icons/ChevronIcon';
import React from 'react';
import {ScrollView, View} from 'react-native';
import SSIProfileIcon from '../../../components/assets/icons/SSIProfileIcon';
import {MainRoutesEnum, RootState} from '../../../types';
import {useSelector} from 'react-redux';
import {SSITextH5LightStyled} from '@sphereon/ui-components.ssi-react-native';
import SSIPersonIcon from '../../../components/assets/icons/SSIPersonIcon';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useLogout} from '../../../hooks/use-logout';

const SettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const {users, activeUser} = useSelector((state: RootState) => state.user);
  const logout = useLogout();
  return (
    <SettingsScreenContainer>
      <SettingsHeaderBar title={translate('settings_title')} onBack={() => navigation.goBack()} />
      <ScrollView>
        <Content>
          <SettingsSection style={{paddingTop: 0, paddingBottom: 0}}>
            <NavigationItem
              onPress={() => navigation.navigate(MainRoutesEnum.ACCOUNT)}
              left={<SSIProfileIcon />}
              text={
                <View style={{flex: 1}}>
                  <UserName>{activeUser?.firstName + ' ' + activeUser?.lastName}</UserName>
                  <SSITextH5LightStyled>Personal</SSITextH5LightStyled>
                </View>
              }
            />
            {users.entries.length > 0 && (
              <>
                <Divider />
                <NavigationItem left={<SSIProfileIcon />} text="Something" />
              </>
            )}
          </SettingsSection>
          <SectionTitle>General</SectionTitle>
          <Divider />
          <SettingsSection>
            <MenuItemRow>
              <SSIPersonIcon color="white" />
              <MenuItemText>Item</MenuItemText>
            </MenuItemRow>
            <MenuItemRow>
              <SSIPersonIcon color="white" />
              <MenuItemText>Item</MenuItemText>
            </MenuItemRow>
            <MenuItemRow>
              <SSIPersonIcon color="white" />
              <MenuItemText>Item</MenuItemText>
            </MenuItemRow>
          </SettingsSection>

          <SectionTitle>{translate('settings_privacy_controls_section_label')}</SectionTitle>
          <Divider />
          <SettingsSection>
            <MenuItemRow>
              <SSIPersonIcon color="white" />
              <MenuItemText>Item</MenuItemText>
            </MenuItemRow>
            <MenuItemRow>
              <SSIPersonIcon color="white" />
              <MenuItemText>Item</MenuItemText>
            </MenuItemRow>
          </SettingsSection>

          <SectionTitle>{translate('settings_feedback_controls_section_label')}</SectionTitle>
          <Divider />
          <SettingsSection>
            <MenuItemRow>
              <SSIPersonIcon color="white" />
              <MenuItemText>Item</MenuItemText>
            </MenuItemRow>
            <MenuItemRow>
              <SSIPersonIcon color="white" />
              <MenuItemText>Item</MenuItemText>
            </MenuItemRow>
          </SettingsSection>
        </Content>
      </ScrollView>
      <MenuItemRow onPress={() => logout()} style={({pressed}) => ({paddingLeft: 24, opacity: pressed ? 0.7 : 1})}>
        <SSIPersonIcon />
        <MenuItemText>{translate('settings_logout_label')}</MenuItemText>
      </MenuItemRow>
    </SettingsScreenContainer>
  );
};

export type NavigationItemProps = {
  left: React.ReactNode;
  text: React.ReactNode;
  onPress?: () => void;
};

export const NavigationItem = (props: NavigationItemProps) => {
  const {left, text, onPress} = props;
  return (
    <NavigationItemRow onPress={onPress}>
      {left}
      {typeof text === 'string' && <NavigationItemRowText style={{flex: 1}}>{text}</NavigationItemRowText>}
      {typeof text !== 'string' && text}
      <View
        style={{
          transform: [
            {
              rotate: '-90deg',
            },
          ],
        }}>
        <ChevronIcon color="white" />
      </View>
    </NavigationItemRow>
  );
};

export default SettingsScreen;
