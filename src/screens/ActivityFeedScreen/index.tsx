import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {useDispatch} from 'react-redux';
import ActivityList from '../../components/activity/ActivityList';
import {useAccessibility} from '../../hooks/useAccessibility';
import {useAppSelector} from '../../hooks/useStore';
import {translate} from '../../localization/Localization';
import {getActivityLogging} from '../../store/actions/logging.actions';
import {Activity, ScreenRoutesEnum, StackParamList} from '../../types';
import {serializeActivity} from '../../utils/activity';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ACTIVITY_FEED>;

const ActivityFeedScreen = ({navigation}: Props) => {
  const dispatch = useDispatch();
  const getActivityLog = () => dispatch(getActivityLogging());
  const {announce} = useAccessibility();
  const {activityLogging, verifiableCredentials} = useAppSelector(({logging: {activityLogging}, credential: {verifiableCredentials}}) => ({
    activityLogging,
    verifiableCredentials,
  }));
  const loading = useAppSelector(state => state.logging.loading);
  const activities = useMemo(
    () =>
      activityLogging
        .filter(activity => activity.parentCredentialHash === undefined)
        .map(a =>
          serializeActivity(
            a,
            verifiableCredentials.find(vc => vc.hash === a.credentialHash),
          ),
        )
        .filter((activity): activity is Activity => Boolean(activity)),
    [activityLogging, verifiableCredentials],
  );
  useFocusEffect(() => announce({message: 'Activity feed screen'}));

  return (
    <ActivityList
      listTitle={translate('activity.feed.list.title')}
      activities={activities}
      loading={loading}
      onActivityPress={(id: string) => navigation.navigate(ScreenRoutesEnum.ACTIVITY_DETAILS, {activity: activities?.find(a => a.id === id)})}
      onRefresh={getActivityLog}
      loadingListText={translate('activity.feed.list.loading')}
      searchInputProps={{
        placeholder: translate('activity.feed.list.search_placeholder'),
      }}
    />
  );
};

export default ActivityFeedScreen;
