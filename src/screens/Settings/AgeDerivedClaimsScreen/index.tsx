import {FC, ReactElement} from 'react';
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
  SettingsHeaderText,
  SettingsScreenContainer,
} from '../components/style';
import {SettingsHeaderBar} from '../components/SettingsHeaderBar';
import {MainRoutesEnum, StackParamList} from '../../../types';
import {translate} from '../../../localization/Localization';
import {ScrollView} from 'react-native';
import ClaimFalseIcon from '../../../components/assets/icons/ClaimFalseIcon';
import {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<StackParamList, MainRoutesEnum.AGE_DERIVED_CLAIMS>;

const AgeDerivedClaimsScreen: FC<Props> = (props: Props): ReactElement => {
  const {route} = props;
  const {claims} = route.params;

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  return (
    <SettingsScreenContainer>
      <SafeAreaView style={{flex: 1}}>
        <SettingsHeaderBar showBottomBorder={false} onBack={() => navigation.goBack()} />
        <ScrollView>
          <Content style={{paddingHorizontal: 24}}>
            <SettingsHeaderText style={{marginVertical: 10, textAlign: 'left'}}>{translate('age_derived_claims_screen_title')}</SettingsHeaderText>
            <AgeDerivedClaimsScreenDescription>{translate('age_dervived_claims_screen_description')}</AgeDerivedClaimsScreenDescription>
            <AgeDerivedClaimsContainer>
              <AgeDerivedClaimsLabel>{translate('age_derived_claims_screen_title')}</AgeDerivedClaimsLabel>
              {Object.entries(claims).map(([key, value]) => (
                <AgeDerivedClaimsRow key={key}>
                  <AgeDerivedClaimsText>{key + ':'}</AgeDerivedClaimsText>
                  {value ? <ClaimTrueIcon /> : <ClaimFalseIcon />}
                </AgeDerivedClaimsRow>
              ))}
            </AgeDerivedClaimsContainer>
          </Content>
        </ScrollView>
      </SafeAreaView>
    </SettingsScreenContainer>
  );
};

export type PreviewProps = {
  claims: Record<number, boolean>;
};

export const AgeDerivedClaimsPreview = (props: PreviewProps) => {
  const {claims} = props;

  let over;
  let before;
  Object.entries(claims).map((value): void => {
    if (value[1]) {
      over = value;
    }
    if (!value[1]) {
      before = value;
      return;
    }
  });

  return (
    <AgeDerivedClaimsPreviewContainer>
      <AgeDerivedClaimsLabel>{translate('age_derived_claims_title')}</AgeDerivedClaimsLabel>
      <AgeDerivedClaimsRow>
        {over && (
          <>
            <AgeDerivedClaimsText>{over[0]}</AgeDerivedClaimsText>
            {over[1] ? <ClaimTrueIcon /> : <ClaimFalseIcon />}
          </>
        )}
      </AgeDerivedClaimsRow>
      <AgeDerivedClaimsRow>
        {before && (
          <>
            <AgeDerivedClaimsText>{before[0]}</AgeDerivedClaimsText>
            {before[1] ? <ClaimTrueIcon /> : <ClaimFalseIcon />}
          </>
        )}
      </AgeDerivedClaimsRow>
    </AgeDerivedClaimsPreviewContainer>
  );
};

export default AgeDerivedClaimsScreen;
