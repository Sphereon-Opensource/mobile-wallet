import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {DefaultActionSubType} from '@sphereon/ssi-types';
import {ACTIVITY_VC_STATUS_CHANGED} from '../../types';
import {backgroundColors} from '@sphereon/ui-components.core';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useDispatch} from 'react-redux';
import ActivityList from '../../components/activity/ActivityList';
import {CredentialViewImage} from '../../components/views/SSICredentialViewItem/CredentailViewImage';
import {useAccessibility} from '../../hooks/useAccessibility';
import {useAppSelector} from '../../hooks/useStore';
import {translate} from '../../localization/Localization';
import {getActivityLogging} from '../../store/actions/logging.actions';
import {Container} from '../../styles/components/screens/SSIContactDetailsScreen';
import {Activity, ScreenRoutesEnum, StackParamList} from '../../types';
import {serializeActivity} from '../../utils/activity';
import {toDisplayCredentialStatus} from '../../utils/credentialVisibility';

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
    case ACTIVITY_VC_STATUS_CHANGED:
      return activity.credentialHash === credential.hash;
    default:
      return false;
  }
};
const CredentialActivityScreen = ({route, navigation}: Props) => {
  const {credential} = route.params;
  const {announce} = useAccessibility();
  const dispatch = useDispatch();
  const getActivityLog = () => dispatch(getActivityLogging());
  const {activityLogging} = useAppSelector(({logging: {activityLogging}}) => ({
    activityLogging,
  }));
  const loading = useAppSelector(state => state.logging.loading);

  const activities = useMemo(
    () =>
      activityLogging
        // filter the double issuance events for parent child credentials
        .filter(
          activity =>
            !(
              (activity.actionSubType === DefaultActionSubType.VC_ISSUE || activity.actionSubType === DefaultActionSubType.VC_ISSUE_DECLINE) &&
              activity.parentCredentialHash !== undefined
            ),
        )
        .map(event => serializeActivity(event))
        .filter((activity): activity is Activity => Boolean(activity))
        .filter(filterForCredential(credential))
        // Attach the (known) credential so status-change rows/details can show its name + card.
        .map(activity => (activity.action === ACTIVITY_VC_STATUS_CHANGED && !activity.credential ? {...activity, credential} : activity)),
    [activityLogging, credential],
  );

  useFocusEffect(
    useCallback(() => {
      getActivityLog();
      announce({message: `Activity feed for ${credential?.branding?.alias ?? credential?.title}`, delay: 1000});
    }, []),
  );

  return (
    <Container style={{backgroundColor: backgroundColors.primaryDark}}>
      {credential?.branding && (
        <View style={{marginHorizontal: 'auto', marginBottom: 24}}>
          <CredentialViewImage branding={credential.branding} credentialStatus={toDisplayCredentialStatus(credential)} />
        </View>
      )}
      <ActivityList
        listTitle={`${translate('activity.credential.list.title')} ${credential?.branding?.alias ?? credential?.title}`}
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
