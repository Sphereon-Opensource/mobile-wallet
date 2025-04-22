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
import {DefaultActionSubType} from '@sphereon/ssi-types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ACTIVITY_FEED>;

const ActivityFeedScreen = ({navigation}: Props) => {
  const dispatch = useDispatch();
  const getActivityLog = () => dispatch(getActivityLogging());
  const {announce} = useAccessibility();
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
        .filter((activity): activity is Activity => Boolean(activity)),
    [activityLogging],
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
