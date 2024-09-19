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
import {Pressable, View} from 'react-native';
import SSIProfileIcon from '../../../components/assets/icons/SSIProfileIcon';
import {MainRoutesEnum, RootState} from 'src/types';
import {useSelector} from 'react-redux';
import {SSITextH5LightStyled} from '@sphereon/ui-components.ssi-react-native';
import SSIPersonIcon from 'src/components/assets/icons/SSIPersonIcon';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const SettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const {users, activeUser} = useSelector((state: RootState) => state.user);
  return (
    <SettingsScreenContainer>
      <SettingsHeaderBar title={translate('settings_title')} onBack={() => navigation.goBack()} />
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

        <SectionTitle>Privacy Controls</SectionTitle>
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

        <SectionTitle>Feedback</SectionTitle>
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
      <MenuItemRow style={{paddingLeft: 24}}>
        <SSIPersonIcon />
        <MenuItemText>Log out</MenuItemText>
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
      <Pressable
        style={({pressed}) => ({
          opacity: pressed ? 0.7 : 1,
          transform: [
            {
              rotate: '-90deg',
            },
          ],
        })}>
        <ChevronIcon color="white" />
      </Pressable>
    </NavigationItemRow>
  );
};

export default SettingsScreen;
