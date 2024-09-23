import {ParamListBase, useNavigation} from '@react-navigation/native';
import SSIPersonIcon from '../../../components/assets/icons/SSIPersonIcon';
import {
  AccountType,
  AccountUserInfoContainer,
  AccountUserInfoName,
  Content,
  Divider,
  MenuItemRow,
  MenuItemText,
  MoreContainer,
  ProviderCardRow,
  ProviderDescription,
  ProviderMiniCardImage,
  SectionTitle,
  SettingsScreenContainer,
  SettingsSection,
} from '../components/style';
import {SettingsHeaderBar} from '../components/SettingsHeaderBar';
import {useSelector} from 'react-redux';
import {MainRoutesEnum, RootState} from '../../../types';
import {translate} from '../../../localization/Localization';
import AusweisIcon from '../../../components/assets/icons/AusweisIcon';
import {SSITextH3LightStyled, SSITextH4LightStyled} from '@sphereon/ui-components.ssi-react-native';
import {ImportInformationSummary} from 'src/screens/Onboarding/ImportDataConsentScreen/components/ImportInformationSummary';
import {AusweisRequestedInfoSchema} from '../../../screens/Onboarding/ImportDataConsentScreen/constants';
import {ScrollView} from 'react-native';
import SSIProfileIcon from 'src/components/assets/icons/SSIProfileIcon';
import {NavigationItem} from '../SettingsScreen';
import AgeIcon from 'src/components/assets/icons/AgeIcon';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AgeDerivedClaimsPreview} from '../AgeDerivedClaimsScreen';
import {useDeleteWallet} from '../../../hooks/use-delete-wallet';

const AccountScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const {users, activeUser} = useSelector((state: RootState) => state.user);
  const deleteWallet = useDeleteWallet();
  return (
    <SettingsScreenContainer>
      <SettingsHeaderBar title={translate('account_title')} onBack={() => navigation.goBack()} />
      <ScrollView>
        <Content>
          <AccountUserInfoContainer style={{marginTop: 20}}>
            <SSIProfileIcon />
            <AccountUserInfoName style={{marginTop: 10}}>{activeUser?.firstName + ' ' + activeUser?.lastName}</AccountUserInfoName>
            <AccountType>{translate('account_personal_section_label')}</AccountType>
          </AccountUserInfoContainer>
          <SettingsSection style={{paddingTop: 0, paddingBottom: 0}}></SettingsSection>
          <SectionTitle>{translate('account_general_section_label')}</SectionTitle>
          <Divider />
          <SettingsSection>
            <MenuItemRow>
              <SSIPersonIcon color="white" />
              <MenuItemText>{translate('account_personal_information_label')}</MenuItemText>
            </MenuItemRow>
            <MenuItemRow>
              <SSIPersonIcon color="white" />
              <MenuItemText>{translate('account_login_and_security_label')}</MenuItemText>
            </MenuItemRow>
            <MenuItemRow>
              <SSIPersonIcon color="white" />
              <MenuItemText>{translate('account_biometric_login_label')}</MenuItemText>
            </MenuItemRow>
          </SettingsSection>

          <SectionTitle>{translate('account_pid_section_label')}</SectionTitle>
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
            <SectionTitle style={{paddingLeft: 0, marginTop: 10}}>More</SectionTitle>
            <MoreContainer>
              <NavigationItem
                onPress={() => navigation.navigate(MainRoutesEnum.AGE_DERIVED_CLAIMS)}
                left={<AgeIcon width={25} height={25} />}
                text={<AgeDerivedClaimsPreview />}
              />
            </MoreContainer>
          </SettingsSection>
        </Content>
      </ScrollView>
      <MenuItemRow onPress={() => deleteWallet()} style={{paddingLeft: 24}}>
        <SSIPersonIcon color="white" />
        <MenuItemText>{translate('account_delete_wallet_label')}</MenuItemText>
      </MenuItemRow>
    </SettingsScreenContainer>
  );
};

export default AccountScreen;
