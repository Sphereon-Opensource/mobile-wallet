import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, { useMemo, useRef, useState } from 'react'
import {useDispatch} from 'react-redux';
import ActivityList from '../../components/activity/ActivityList';
import {useAccessibility} from '../../hooks/useAccessibility';
import {useAppSelector} from '../../hooks/useStore';
import {translate} from '../../localization/Localization';
import {getActivityLogging} from '../../store/actions/logging.actions';
import {Activity, ScreenRoutesEnum, StackParamList} from '../../types';
import {serializeActivity} from '../../utils/activity';
import CredentialCardStackView from '../../components/views/CredentialCardStackView'
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import {credentialSummaryMock} from './credentialMock';

import {

  SSIBasicContainerStyled as Container,
} from '../../styles/components';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ACTIVITY_FEED>;

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
  credentialSummaryMock('10'),
  credentialSummaryMock('11'),
  credentialSummaryMock('12'),
  credentialSummaryMock('13'),
  credentialSummaryMock('14'),
  credentialSummaryMock('15'),
  credentialSummaryMock('16'),
  credentialSummaryMock('17'),
  credentialSummaryMock('18'),
  credentialSummaryMock('19'),
  credentialSummaryMock('20'),
  credentialSummaryMock('21'),
  credentialSummaryMock('22'),
  credentialSummaryMock('23'),
  credentialSummaryMock('24'),
  credentialSummaryMock('25'),
  credentialSummaryMock('26'),
  credentialSummaryMock('27'),
];

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
    <Container>
      <CredentialCardStackView
        credentials={mocked}
      />
    </Container>


    // <ActivityList
    //   listTitle={translate('activity.feed.list.title')}
    //   activities={activities}
    //   loading={loading}
    //   onActivityPress={(id: string) => navigation.navigate(ScreenRoutesEnum.ACTIVITY_DETAILS, {activity: activities?.find(a => a.id === id)})}
    //   onRefresh={getActivityLog}
    //   loadingListText={translate('activity.feed.list.loading')}
    //   searchInputProps={{
    //     placeholder: translate('activity.feed.list.search_placeholder'),
    //   }}
    // />
  );
};

export default ActivityFeedScreen;
