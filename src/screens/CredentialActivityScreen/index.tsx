import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {DefaultActionSubType} from '@sphereon/ssi-types';
import {backgroundColors} from '@sphereon/ui-components.core';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useDispatch} from 'react-redux';
import ActivityList from '../../components/activity/ActivityList';
import {CredentialViewImage} from '../../components/views/SSICredentialViewItem/CredentailViewImage';
import {useAppSelector} from '../../hooks/useStore';
import {translate} from '../../localization/Localization';
import {getActivityLogging} from '../../store/actions/logging.actions';
import {Container} from '../../styles/components/screens/SSIContactDetailsScreen';
import {Activity, ScreenRoutesEnum, StackParamList} from '../../types';
import {serializeActivity} from '../../utils/activity';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_ACTIVITY>;

const filterForCredential = (credential?: CredentialSummary) => (activity: Activity) => {
  if (!credential) {
    return false;
  }
  switch (activity.action) {
    case DefaultActionSubType.VC_ISSUE:
    case DefaultActionSubType.VC_ISSUE_DECLINE:
      return activity.credential?.hash === credential.hash;
    case DefaultActionSubType.VC_SHARE:
    case DefaultActionSubType.VC_SHARE_DECLINE:
      return activity.shared.some(s => s.credential?.hash === credential.hash);
    default:
      return false;
  }
};
const CredentialActivityScreen = ({route, navigation}: Props) => {
  const {credential} = route.params;
  const dispatch = useDispatch();
  const getActivityLog = () => dispatch(getActivityLogging());
  const {activityLogging, verifiableCredentials} = useAppSelector(({logging: {activityLogging}, credential: {verifiableCredentials}}) => ({
    activityLogging,
    verifiableCredentials,
  }));
  const loading = useAppSelector(state => state.logging.loading);

  const activities = useMemo(
    () =>
      activityLogging
        .map(a =>
          serializeActivity(
            a,
            verifiableCredentials.find(vc => vc.hash === a.credentialHash),
          ),
        )
        .filter((activity): activity is Activity => Boolean(activity))
        .filter(filterForCredential(credential)),
    [activityLogging, verifiableCredentials, credential],
  );

  return (
    <Container style={{backgroundColor: backgroundColors.primaryDark}}>
      {credential?.branding && (
        <View style={{marginHorizontal: 'auto', marginBottom: 24}}>
          <CredentialViewImage branding={credential.branding} />
        </View>
      )}
      <ActivityList
        listTitle={`${translate('activity.credential.list.title')} ${credential?.title}`}
        activities={activities}
        loading={loading}
        onActivityPress={(id: string) => navigation.push(ScreenRoutesEnum.ACTIVITY_DETAILS, {activity: activities?.find(a => a.id === id)})}
        onRefresh={getActivityLog}
        loadingListText={`${translate('activity.credential.list.loading')} ${credential?.title}`}
        searchInputProps={{placeholder: translate('activity.credential.list.search_placeholder')}}
      />
    </Container>
  );
};

export default CredentialActivityScreen;
