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
  ToggleDescription,
  ToggleLabel,
  ToggleRow,
  ToggleTextContainer,
  UserName,
} from '../components/style';
import Localization, {translate} from '../../../localization/Localization';
import ChevronIcon from '../../../components/assets/icons/ChevronIcon';
import React, {useCallback, useState} from 'react';
import {ScrollView, Switch, TouchableOpacity, View} from 'react-native';
import SSIProfileIcon from '../../../components/assets/icons/SSIProfileIcon';
import {ButtonIconsEnum, MainRoutesEnum, RootState, ScreenRoutesEnum} from '../../../types';
import {useDispatch, useSelector} from 'react-redux';
import {SSITextH5LightStyled} from '@sphereon/ui-components.ssi-react-native';
import SSIPersonIcon from '../../../components/assets/icons/SSIPersonIcon';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useLogout} from '../../../hooks/use-logout';
import {SafeAreaView} from 'react-native-safe-area-context';
import {updatePreferences} from '../../../store/actions/user.actions';
import {getVerifiableCredentials} from '../../../store/actions/credential.actions';
import {IUserPreferences} from '../../../types/preferences';
import LanguageSelectionModal, {LANGUAGE_OPTIONS} from '../../../modals/LanguageSelectionModal';
import SSIIconButton from '../../../components/buttons/SSIIconButton';
import {backgroundColors} from '@sphereon/ui-components.core';
import SSITextInputControlledField from '../../../components/fields/SSITextInputControlledField';

type PreferenceBooleanKey = keyof {
  [K in keyof IUserPreferences as IUserPreferences[K] extends boolean ? K : never]: true;
};

interface SettingsToggleProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const SettingsToggle = ({label, description, value, onValueChange}: SettingsToggleProps) => (
  <ToggleRow>
    <ToggleTextContainer>
      <ToggleLabel>{label}</ToggleLabel>
      <ToggleDescription>{description}</ToggleDescription>
    </ToggleTextContainer>
    <Switch value={value} onValueChange={onValueChange} trackColor={{false: '#767577', true: '#5B69E5'}} thumbColor="white" />
  </ToggleRow>
);

const SettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const dispatch = useDispatch();
  const {users, activeUser} = useSelector((state: RootState) => state.user);
  const logout = useLogout();
  const preferences = activeUser?.preferences;
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const onTogglePreference = useCallback(
    (key: PreferenceBooleanKey, value: boolean) => {
      dispatch<any>(updatePreferences({[key]: value}));
    },
    [dispatch],
  );

  const onLanguageChange = useCallback(
    (language: string | null) => {
      dispatch<any>(updatePreferences({language}));
      Localization.setI18nConfig(language);
      // Re-fetch credentials so branding/claim labels are recomputed for the new locale
      dispatch<any>(getVerifiableCredentials());
    },
    [dispatch],
  );

  const currentLanguageLabel =
    LANGUAGE_OPTIONS.find(opt => opt.value === (preferences?.language ?? null))?.label ?? translate('settings_language_system_default');

  return (
    <SettingsScreenContainer>
      <SafeAreaView style={{flex: 1}}>
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
                    <SSITextH5LightStyled>{translate('account_personal_section_label')}</SSITextH5LightStyled>
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

            <SectionTitle>{translate('settings_language_section_label')}</SectionTitle>
            <Divider />
            <SettingsSection>
              <TouchableOpacity
                onPress={() => setIsLanguageModalOpen(true)}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Select language"
                accessibilityHint="Opens a modal to select your language">
                <SSITextInputControlledField
                  importantForAccessibility="no"
                  autoFocus={false}
                  editable={false}
                  value={currentLanguageLabel}
                  label={translate('settings_language_section_label')}
                  onPress={() => setIsLanguageModalOpen(true)}
                  onPressIn={() => setIsLanguageModalOpen(true)}
                  endAdornment={
                    <SSIIconButton
                      importantForAccessibility="no"
                      icon={ButtonIconsEnum.CHEVRON}
                      iconColor={backgroundColors.primaryLight}
                      iconSize={16}
                      style={{marginRight: 8}}
                      onPress={() => setIsLanguageModalOpen(true)}
                    />
                  }
                />
              </TouchableOpacity>
            </SettingsSection>

            <SectionTitle>{translate('settings_privacy_security_section_label')}</SectionTitle>
            <Divider />
            <SettingsSection>
              <SettingsToggle
                label={translate('settings_warn_on_external_link_label')}
                description={translate('settings_warn_on_external_link_description')}
                value={preferences?.warnOnExternalLink ?? true}
                onValueChange={v => onTogglePreference('warnOnExternalLink', v)}
              />
              <SettingsToggle
                label={translate('settings_warn_on_low_trust_label')}
                description={translate('settings_warn_on_low_trust_description')}
                value={preferences?.warnOnLowTrust ?? true}
                onValueChange={v => onTogglePreference('warnOnLowTrust', v)}
              />
              <SettingsToggle
                label={translate('settings_confirm_browser_open_label')}
                description={translate('settings_confirm_browser_open_description')}
                value={preferences?.confirmBrowserOpen ?? true}
                onValueChange={v => onTogglePreference('confirmBrowserOpen', v)}
              />
              <SettingsToggle
                label={translate('settings_show_claim_values_by_default_label')}
                description={translate('settings_show_claim_values_by_default_description')}
                value={preferences?.showClaimValuesByDefault ?? false}
                onValueChange={v => onTogglePreference('showClaimValuesByDefault', v)}
              />
            </SettingsSection>

            <SectionTitle>{translate('settings_trust_section_label')}</SectionTitle>
            <Divider />
            <SettingsSection>
              <NavigationItem
                onPress={() => navigation.navigate(ScreenRoutesEnum.TRUST_ANCHORS_OVERVIEW)}
                text={translate('settings_trust_anchors_label')}
              />
            </SettingsSection>
          </Content>
        </ScrollView>
        <MenuItemRow onPress={() => logout()} style={({pressed}) => ({paddingLeft: 24, opacity: pressed ? 0.7 : 1})}>
          <SSIPersonIcon />
          <MenuItemText>{translate('settings_logout_label')}</MenuItemText>
        </MenuItemRow>
        <LanguageSelectionModal
          open={isLanguageModalOpen}
          selected={preferences?.language ?? null}
          options={LANGUAGE_OPTIONS}
          onClose={() => setIsLanguageModalOpen(false)}
          onSelect={onLanguageChange}
        />
      </SafeAreaView>
    </SettingsScreenContainer>
  );
};

export type NavigationItemProps = {
  left?: React.ReactNode;
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
