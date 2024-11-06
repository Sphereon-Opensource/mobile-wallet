import {ParamListBase, useNavigation} from '@react-navigation/native';
import ClaimTrueIcon from '../../../components/assets/icons/ClaimTrueIcon';
import {
  AgeDerivedClaimsContainer,
  AgeDerivedClaimsLabel,
  AgeDerivedClaimsPreviewContainer,
  AgeDerivedClaimsRow,
  AgeDerivedClaimsScreenDescription,
  AgeDerivedClaimsText,
  Content,
  MoreText,
  SettingsHeaderText,
  SettingsScreenContainer,
} from '../components/style';
import {SettingsHeaderBar} from '../components/SettingsHeaderBar';
import {useSelector} from 'react-redux';
import {RootState} from '../../../types';
import {translate} from '../../../localization/Localization';
import {ScrollView} from 'react-native';
import ClaimFalseIcon from '../../../components/assets/icons/ClaimFalseIcon';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const AgeDerivedClaimsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const {users, activeUser} = useSelector((state: RootState) => state.user);
  return (
    <SettingsScreenContainer>
      <SettingsHeaderBar showBottomBorder={false} onBack={() => navigation.goBack()} />
      <ScrollView>
        <Content style={{paddingHorizontal: 24}}>
          <SettingsHeaderText style={{marginVertical: 10, textAlign: 'left'}}>{translate('age_derived_claims_screen_title')}</SettingsHeaderText>
          <AgeDerivedClaimsScreenDescription>{translate('age_dervived_claims_screen_description')}</AgeDerivedClaimsScreenDescription>
          <AgeDerivedClaimsContainer>
            <AgeDerivedClaimsLabel>{translate('age_derived_claims_screen_title')}</AgeDerivedClaimsLabel>
            {mockClaims.map(claim => (
              <AgeDerivedClaimsRow key={claim.key}>
                <AgeDerivedClaimsText>{claim.key + ':'}</AgeDerivedClaimsText>
                {claim.value ? <ClaimTrueIcon /> : <ClaimFalseIcon />}
              </AgeDerivedClaimsRow>
            ))}
          </AgeDerivedClaimsContainer>
        </Content>
      </ScrollView>
    </SettingsScreenContainer>
  );
};

const mockClaims = [
  {key: '0', value: true},
  {key: '1', value: true},
  {key: '2', value: true},
  {key: '3', value: true},
  {key: '4', value: true},
  {key: '21', value: true},
  {key: '24', value: true},
  {key: '30', value: true},
  {key: '42', value: true},
  {key: '50', value: true},
  {key: '60', value: true},
  {key: '65', value: true},
];

export const AgeDerivedClaimsPreview = () => {
  return (
    <AgeDerivedClaimsPreviewContainer>
      <AgeDerivedClaimsLabel>{translate('age_derived_claims_title')}</AgeDerivedClaimsLabel>
      <AgeDerivedClaimsRow>
        <AgeDerivedClaimsText>{mockClaims[6].key}</AgeDerivedClaimsText>
        {mockClaims[6].value ? <ClaimTrueIcon /> : <ClaimFalseIcon />}
      </AgeDerivedClaimsRow>
      <AgeDerivedClaimsRow>
        <MoreText>{mockClaims[7].key}</MoreText>
        {mockClaims[7].value ? <ClaimTrueIcon /> : <ClaimFalseIcon />}
      </AgeDerivedClaimsRow>
    </AgeDerivedClaimsPreviewContainer>
  );
};

export default AgeDerivedClaimsScreen;
