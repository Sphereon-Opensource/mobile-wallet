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
  PersonalInfoLabel,
  PersonalInfoValue,
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
import {ScrollView, View} from 'react-native';
import SSIProfileIcon from '../../../components/assets/icons/SSIProfileIcon';
import {NavigationItem} from '../SettingsScreen';
import AgeIcon from '../../../components/assets/icons/AgeIcon';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AgeDerivedClaimsPreview} from '../AgeDerivedClaimsScreen';
import {useDeleteWallet} from '../../../hooks/use-delete-wallet';
import {getVerifiableCredentialsFromStorage} from '../../../services/credentialService';
import {RegulationType} from '@sphereon/ssi-sdk.data-store-types';
import React, {useEffect, useMemo, useState} from 'react';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {convertFromPIDPayload} from '../../Onboarding/ImportDataConsentScreen/util';
import {SafeAreaView} from 'react-native-safe-area-context';
import SSITextInputControlledField from '../../../components/fields/SSITextInputControlledField';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {reissueWalletIdentityCredential} from '../../../services/machines/onboardingMachineService';
import {authenticate} from '../../../services/authenticationService';

const AccountScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const {activeUser} = useSelector((state: RootState) => state.user);
  const deleteWallet = useDeleteWallet();
  const [pidInfo, setPidInfo] = useState<Array<AusweisRequestedInfoItem>>([]);
  const [pid, setPid] = useState<UniqueDigitalCredential | undefined>();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(activeUser?.firstName ?? '');
  const [lastName, setLastName] = useState(activeUser?.lastName ?? '');
  const [emailAddress, setEmailAddress] = useState(activeUser?.emailAddress ?? '');
  const [saving, setSaving] = useState(false);

  const isDirty = useMemo(
    () => firstName !== (activeUser?.firstName ?? '') || lastName !== (activeUser?.lastName ?? '') || emailAddress !== (activeUser?.emailAddress ?? ''),
    [firstName, lastName, emailAddress, activeUser],
  );

  const handleEdit = () => {
    setFirstName(activeUser?.firstName ?? '');
    setLastName(activeUser?.lastName ?? '');
    setEmailAddress(activeUser?.emailAddress ?? '');
    setEditing(true);
  };

  const handleCancel = () => {
    setFirstName(activeUser?.firstName ?? '');
    setLastName(activeUser?.lastName ?? '');
    setEmailAddress(activeUser?.emailAddress ?? '');
    setEditing(false);
  };

  const handleSave = async () => {
    await authenticate(async () => {
      navigation.goBack();
      setSaving(true);
      try {
        await reissueWalletIdentityCredential({firstName, lastName, emailAddress});
        setEditing(false);
      } catch (e) {
        console.error('Failed to save account info:', e);
      } finally {
        setSaving(false);
      }
    });
  };

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
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24}}>
              <SectionTitle>{translate('account_personal_information_label')}</SectionTitle>
              {!editing && (
                <PersonalInfoLabel onPress={handleEdit} style={{color: '#7B61FF'}}>
                  {translate('account_edit_label')}
                </PersonalInfoLabel>
              )}
            </View>
            <Divider />
            {editing ? (
              <SettingsSection style={{gap: 12}}>
                <SSITextInputControlledField
                  label={translate('account_first_name_label')}
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!saving}
                />
                <SSITextInputControlledField
                  label={translate('account_last_name_label')}
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!saving}
                />
                <SSITextInputControlledField
                  label={translate('account_email_label')}
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!saving}
                />
                <View style={{gap: 12, marginTop: 8}}>
                  {isDirty && (
                    <PrimaryButton caption={saving ? '...' : translate('account_save_label')} onPress={handleSave} disabled={saving} />
                  )}
                  <SecondaryButton caption={translate('action_cancel_label')} onPress={handleCancel} disabled={saving} />
                </View>
              </SettingsSection>
            ) : (
              <SettingsSection style={{gap: 12}}>
                <View>
                  <PersonalInfoLabel>{translate('account_first_name_label')}</PersonalInfoLabel>
                  <PersonalInfoValue>{activeUser?.firstName || '—'}</PersonalInfoValue>
                </View>
                <View>
                  <PersonalInfoLabel>{translate('account_last_name_label')}</PersonalInfoLabel>
                  <PersonalInfoValue>{activeUser?.lastName || '—'}</PersonalInfoValue>
                </View>
                <View>
                  <PersonalInfoLabel>{translate('account_email_label')}</PersonalInfoLabel>
                  <PersonalInfoValue>{activeUser?.emailAddress || '—'}</PersonalInfoValue>
                </View>
              </SettingsSection>
            )}
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
                          claims: (pid?.uniformVerifiableCredential?.credentialSubject as any)?.age_equal_or_over,
                        })
                      }
                      left={<AgeIcon width={25} height={25} />}
                      // @ts-ignore // TODO fix types later
                      text={
                        React.createElement(AgeDerivedClaimsPreview as any, {
                          age: (pid?.uniformVerifiableCredential?.credentialSubject as any)?.age_in_years,
                          claims: (pid?.uniformVerifiableCredential?.credentialSubject as any)?.age_equal_or_over,
                        })
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
