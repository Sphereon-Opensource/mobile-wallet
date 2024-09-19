import {useNavigation} from '@react-navigation/native';
import SSIPersonIcon from '../../../components/assets/icons/SSIPersonIcon';
import {
  AccountType,
  AccountUserInfoContainer,
  AccountUserInfoName,
  Content,
  Divider,
  MenuItemRow,
  MenuItemText,
  ProviderCardRow,
  ProviderDescription,
  ProviderMiniCardImage,
  SectionTitle,
  SettingsScreenContainer,
  SettingsSection,
} from '../components/style';
import {SettingsHeaderBar} from '../components/SettingsHeaderBar';
import {useSelector} from 'react-redux';
import {RootState} from '../../../types';
import {translate} from '../../../localization/Localization';
import AusweisIcon from '../../../components/assets/icons/AusweisIcon';
import {SSITextH3LightStyled, SSITextH4LightStyled} from '@sphereon/ui-components.ssi-react-native';
import {ImportInformationSummary} from 'src/screens/Onboarding/ImportDataConsentScreen/components/ImportInformationSummary';
import {AusweisRequestedInfoSchema} from '../../../screens/Onboarding/ImportDataConsentScreen/constants';
import {ScrollView} from 'react-native';
import SSIProfileIcon from 'src/components/assets/icons/SSIProfileIcon';

const AccountScreen = () => {
  const navigation = useNavigation();
  const {users, activeUser} = useSelector((state: RootState) => state.user);
  return (
    <SettingsScreenContainer>
      <SettingsHeaderBar title={translate('account_title')} onBack={() => navigation.goBack()} />
      <ScrollView>
        <Content>
          <AccountUserInfoContainer style={{marginTop: 20}}>
            <SSIProfileIcon />
            <AccountUserInfoName style={{marginTop: 10}}>{activeUser?.firstName + ' ' + activeUser?.lastName}</AccountUserInfoName>
            <AccountType>Personal</AccountType>
          </AccountUserInfoContainer>
          <SettingsSection style={{paddingTop: 0, paddingBottom: 0}}></SettingsSection>
          <SectionTitle>General</SectionTitle>
          <Divider />
          <SettingsSection>
            <MenuItemRow>
              <SSIPersonIcon color="white" />
              <MenuItemText>Personal information</MenuItemText>
            </MenuItemRow>
            <MenuItemRow>
              <SSIPersonIcon color="white" />
              <MenuItemText>Login and security</MenuItemText>
            </MenuItemRow>
            <MenuItemRow>
              <SSIPersonIcon color="white" />
              <MenuItemText>Biometric authentication</MenuItemText>
            </MenuItemRow>
          </SettingsSection>

          <SectionTitle>Privacy Controls</SectionTitle>
          <Divider />
          <SettingsSection>
            <ProviderCardRow>
              <ProviderMiniCardImage>
                <AusweisIcon height={45} width={55} />
              </ProviderMiniCardImage>
              <ProviderDescription>
                <SSITextH3LightStyled>Ausweis eID</SSITextH3LightStyled>
                <SSITextH4LightStyled>German Bundesdruckerei</SSITextH4LightStyled>
              </ProviderDescription>
            </ProviderCardRow>
            <ImportInformationSummary data={AusweisRequestedInfoSchema} />
          </SettingsSection>
        </Content>
      </ScrollView>
      <MenuItemRow style={{paddingLeft: 24}}>
        <SSIPersonIcon color="white" />
        <MenuItemText>Delete Wallet</MenuItemText>
      </MenuItemRow>
    </SettingsScreenContainer>
  );
};

export default AccountScreen;
