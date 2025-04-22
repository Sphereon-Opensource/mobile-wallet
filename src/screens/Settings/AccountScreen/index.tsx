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
import {ImportInformationSummary} from '../../Onboarding/ImportDataConsentScreen/components/ImportInformationSummary';
import {AusweisRequestedInfoItem} from '../../Onboarding/ImportDataConsentScreen/constants';
import {ScrollView} from 'react-native';
import SSIProfileIcon from '../../../components/assets/icons/SSIProfileIcon';
import {NavigationItem} from '../SettingsScreen';
import AgeIcon from '../../../components/assets/icons/AgeIcon';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AgeDerivedClaimsPreview} from '../AgeDerivedClaimsScreen';
import {useDeleteWallet} from '../../../hooks/use-delete-wallet';
import {getVerifiableCredentialsFromStorage} from '../../../services/credentialService';
import {RegulationType} from '@sphereon/ssi-sdk.data-store';
import React, {useEffect, useState} from 'react';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {convertFromPIDPayload} from '../../Onboarding/ImportDataConsentScreen/util';
import {SafeAreaView} from 'react-native-safe-area-context';

const AccountScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const {activeUser} = useSelector((state: RootState) => state.user);
  const deleteWallet = useDeleteWallet();
  const [pidInfo, setPidInfo] = useState<Array<AusweisRequestedInfoItem>>([]);
  const [pid, setPid] = useState<UniqueDigitalCredential | undefined>();

  useEffect(() => {
    getVerifiableCredentialsFromStorage({regulationTypes: [RegulationType.PID], parentsOnly: true}).then(pid => {
      if (pid?.[0]?.uniformVerifiableCredential?.credentialSubject) {
        setPid(pid?.[0]);
        setPidInfo(convertFromPIDPayload(pid?.[0].uniformVerifiableCredential?.credentialSubject, 'import'));
      }
    });
  }, []);

  return (
    <SettingsScreenContainer>
      <SafeAreaView style={{flex: 1}}>
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
            {pidInfo.length > 0 && (
              <>
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
                  <ImportInformationSummary data={pidInfo} />
                  <SectionTitle style={{paddingLeft: 0, marginTop: 10}}>More</SectionTitle>
                  <MoreContainer>
                    <NavigationItem
                      // @ts-ignore // TODO fix types later
                      onPress={() =>
                        navigation.navigate(MainRoutesEnum.AGE_DERIVED_CLAIMS, {
                          claims: pid?.uniformVerifiableCredential?.credentialSubject.age_equal_or_over,
                        })
                      }
                      left={<AgeIcon width={25} height={25} />}
                      // @ts-ignore // TODO fix types later
                      text={
                        <AgeDerivedClaimsPreview
                          age={pid?.uniformVerifiableCredential?.credentialSubject.age_in_years}
                          claims={pid?.uniformVerifiableCredential?.credentialSubject.age_equal_or_over}
                        />
                      }
                    />
                  </MoreContainer>
                </SettingsSection>
              </>
            )}
          </Content>
        </ScrollView>
        <MenuItemRow onPress={() => deleteWallet()} style={{paddingLeft: 24}}>
          <SSIPersonIcon color="white" />
          <MenuItemText>{translate('account_delete_wallet_label')}</MenuItemText>
        </MenuItemRow>
      </SafeAreaView>
    </SettingsScreenContainer>
  );
};

export default AccountScreen;
