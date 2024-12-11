import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SSILogo} from '@sphereon/ui-components.ssi-react-native';
import React, {useMemo} from 'react';
import {useDispatch} from 'react-redux';
import ActivityList from '../../components/activity/ActivityList';
import {useAccessibility} from '../../hooks/useAccessibility';
import {useAppSelector} from '../../hooks/useStore';
import {translate} from '../../localization/Localization';
import {getActivityLogging} from '../../store/actions/logging.actions';
import {Container} from '../../styles/components/screens/SSIContactDetailsScreen';
import {Activity, ScreenRoutesEnum, StackParamList} from '../../types';
import {serializeActivity} from '../../utils/activity';
import {DefaultActionSubType} from '@sphereon/ssi-types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_ACTIVITY>;

const ContactActivityScreen = ({route, navigation}: Props) => {
  const {contact} = route.params;
  const {announce} = useAccessibility();
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
        // filter the double issuance events for parent child credentials
        .filter(activity => !((activity.actionSubType === DefaultActionSubType.VC_ISSUE) && activity.parentCredentialHash === undefined))
        .map(a =>
          serializeActivity(
            a,
              verifiableCredentials.find(vc => vc.hash === a.credentialHash || vc.hash === a.parentCredentialHash),
          ),
        )
        .filter((activity): activity is Activity => Boolean(activity))
        .filter(a => a.contactAlias === contact.contact.displayName),
    [activityLogging, verifiableCredentials, contact],
  );
  useFocusEffect(() => announce({message: `Activity feed for ${contact.contact.displayName}`, delay: 1000}));
  return (
    <Container>
      <SSILogo logo={contact.branding?.logo} size={40} style={{marginHorizontal: 'auto', marginBottom: 24}} />
      <ActivityList
        listTitle={`${translate('activity.contact.list.title')} ${contact.contact.displayName}`}
        activities={activities}
        loading={loading}
        onActivityPress={(id: string) => navigation.push(ScreenRoutesEnum.ACTIVITY_DETAILS, {activity: activities?.find(a => a.id === id)})}
        onRefresh={getActivityLog}
        loadingListText={translate('activity.contact.list.loading')}
        searchInputProps={{placeholder: translate('activity.contact.list.search_placeholder')}}
      />
    </Container>
  );
};

export default ContactActivityScreen;
