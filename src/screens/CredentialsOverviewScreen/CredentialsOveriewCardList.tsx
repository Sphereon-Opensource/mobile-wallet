import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {backgroundColors} from '@sphereon/ui-components.core';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {connect} from 'react-redux';
import {getVerifiableCredential} from '../../services/credentialService';
import {setViewPreference} from '../../store/actions/user.actions';
import {CreditOverviewStackParamsList, RootState, ScreenRoutesEnum} from '../../types';
import {ConfigurableViewKey, ViewPreference} from '../../types/preferences';
import {CardContainer} from './CardContainer';
import {credentialSummaryMock} from './credentialMock';

type Props = NativeStackScreenProps<CreditOverviewStackParamsList, 'Card'> & {
  verifiableCredentials: Array<CredentialSummary>;
  setViewPreference: (viewKey: ConfigurableViewKey, preference: ViewPreference) => void;
};

const mocked: CredentialSummary[] = [
  credentialSummaryMock('1'),
  credentialSummaryMock('2'),
  credentialSummaryMock('3'),
  credentialSummaryMock('4'),
  credentialSummaryMock('5'),
  credentialSummaryMock('6'),
  credentialSummaryMock('7'),
  credentialSummaryMock('8'),
  credentialSummaryMock('9'),
  // credentialSummaryMock('10'),
  // credentialSummaryMock('11'),
  // credentialSummaryMock('12'),
  // credentialSummaryMock('13'),
  // credentialSummaryMock('14'),
  // credentialSummaryMock('15'),
  // credentialSummaryMock('16'),
  // credentialSummaryMock('17'),
  // credentialSummaryMock('18'),
  // credentialSummaryMock('19'),
  // credentialSummaryMock('20'),
  // credentialSummaryMock('21'),
  // credentialSummaryMock('22'),
  // credentialSummaryMock('23'),
];

const CredentialsOverviewCardList = ({setViewPreference, verifiableCredentials, navigation, route}: Props) => {
  const selected = route.params?.selected;
  useFocusEffect(
    useCallback(() => {
      setViewPreference(ConfigurableViewKey.CREDENTIAL_OVERVIEW, ViewPreference.CARD);
    }, []),
  );

  const onItemPress = async (credential: CredentialSummary): Promise<void> => {
    const uniqueDigitalCredential = await getVerifiableCredential({credentialRole: credential.credentialRole, hash: credential.hash});
    navigation.getParent()?.navigate(ScreenRoutesEnum.CREDENTIAL_DETAILS, {
      rawCredential: uniqueDigitalCredential.originalVerifiableCredential, // TODO remove rawCredential
      uniqueDigitalCredential,
      credential,
      showActivity: false,
    });
  };

  return (
    <View style={{backgroundColor: backgroundColors.primaryDark, flex: 1, paddingHorizontal: 24, alignItems: 'center'}}>
      <CardContainer credentials={mocked} onItemPressWhenSelected={onItemPress} />
    </View>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    verifiableCredentials: state.credential.verifiableCredentials,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setViewPreference: (viewKey: ConfigurableViewKey, preference: ViewPreference) => dispatch(setViewPreference(viewKey, preference)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CredentialsOverviewCardList);
