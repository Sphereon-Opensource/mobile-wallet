import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {DefaultActionSubType} from '@sphereon/ssi-types';
import styled from 'styled-components/native';
import {SSIBasicContainerStyled} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import ContactCredentialShareActivity from './ContactCredentialShareActivity';
import CredentialIssuedActivity from './CredentialIssuedActivity';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ACTIVITY_DETAILS>;

const Container = styled(SSIBasicContainerStyled)`
  padding-horizontal: 16px;
  padding-top: 32px;
  gap: 24px;
`;

export const ActivityDetailScreen = (navProps: Props) => {
  const {activity} = navProps.route.params;
  if (!activity) return null;
  const isShare = activity.action === DefaultActionSubType.VC_SHARE || activity.action === DefaultActionSubType.VC_SHARE_DECLINE;
  const isIssue = activity.action === DefaultActionSubType.VC_ISSUE || activity.action === DefaultActionSubType.VC_ISSUE_DECLINE;
  return (
    <Container>
      {isShare && <ContactCredentialShareActivity activity={activity} {...navProps} />}
      {isIssue && <CredentialIssuedActivity activity={activity} {...navProps} />}
    </Container>
  );
};

export default ActivityDetailScreen;
