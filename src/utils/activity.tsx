import {ComponentType, ReactElement} from 'react';
import {ActivityLoggingEvent} from '@sphereon/ssi-sdk.core';
import {DefaultActionSubType} from '@sphereon/ssi-types';
import {ColorValue, View} from 'react-native';
import styled from 'styled-components/native';
import {RowProps} from '../components/activity/ActivityEventRow';
import IssueFailureIcon from '../components/assets/icons/IssueFailureIcon';
import IssueSuccessIcon from '../components/assets/icons/IssueSuccessIcon';
import ShareFailureIcon from '../components/assets/icons/ShareFailureIcon';
import ShareSuccessIcon, {IProps} from '../components/assets/icons/ShareSuccessIcon';
import {translate} from '../localization/Localization';
import {
  Activity,
  ActivityActionResult,
  ActivityIssueType,
  ActivityShareType,
  ActivityType,
  IContactCredentialsShareActivity,
  ICredentialIssuedActivity,
} from '../types';
import {parseAndValidateJson} from './json';
import {isDiagnosticData} from './validate';

type StatusProps = {
  title: string;
  description?: string;
  icon?: ReactElement;
};

export const getActivityStatusText = (activity: Activity): StatusProps => {
  switch (activity.action) {
    case DefaultActionSubType.VC_SHARE:
      return {
        title: translate(`activity.${DefaultActionSubType.VC_SHARE}.detail_title`),
        icon: actionResultIconMap[activity.action].detail,
      };
    case DefaultActionSubType.VC_SHARE_DECLINE:
      return {
        title: translate(`activity.${DefaultActionSubType.VC_SHARE_DECLINE}.detail_title`),
        icon: actionResultIconMap[activity.action].detail,
      };
    case DefaultActionSubType.VC_ISSUE:
      return {
        title: translate(`activity.${DefaultActionSubType.VC_ISSUE}.detail_title`),
        description: [
          translate(`activity.${DefaultActionSubType.VC_ISSUE}.description`)[0],
          activity.credential?.branding?.alias ?? activity.credential?.title ?? translate('activity.unknown.credential'),
          translate(`activity.${DefaultActionSubType.VC_ISSUE}.description`)[1],
        ].join(' '),
        icon: actionResultIconMap[activity.action].detail,
      };
    case DefaultActionSubType.VC_ISSUE_DECLINE:
      return {
        title: translate(`activity.${DefaultActionSubType.VC_ISSUE_DECLINE}.detail_title`),
        description: [
          translate(`activity.${DefaultActionSubType.VC_ISSUE_DECLINE}.description`)[0],
          activity.credential?.branding?.alias ?? activity.credential?.title ?? translate('activity.unknown.credential'),
          translate(`activity.${DefaultActionSubType.VC_ISSUE_DECLINE}.description`)[1],
        ].join(' '),
        icon: actionResultIconMap[activity.action].detail,
      };
  }
};

type Icons = {
  row: JSX.Element;
  detail: JSX.Element;
};

const RowIconWrapper = styled(View)`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
`;

const DetailIconWrapper = styled(View)`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
`;

const icons = (background: ColorValue, Icon: ComponentType<IProps>): Icons => {
  return {
    row: (
      <RowIconWrapper style={{backgroundColor: background}}>
        <Icon size={12} />
      </RowIconWrapper>
    ),
    detail: (
      <DetailIconWrapper>
        <Icon size={20} />
      </DetailIconWrapper>
    ),
  };
};

const actionResultIconMap: Record<ActivityType, Icons> = {
  [DefaultActionSubType.VC_SHARE]: icons('#00C24933', ShareSuccessIcon),
  [DefaultActionSubType.VC_SHARE_DECLINE]: icons('#D745001F', ShareFailureIcon),
  [DefaultActionSubType.VC_ISSUE]: icons('#00C24933', IssueSuccessIcon),
  [DefaultActionSubType.VC_ISSUE_DECLINE]: icons('#D745001F', IssueFailureIcon),
};

export const toActivityEventRow = (activity: Activity): Omit<RowProps, 'index' | 'onPress'> & {id: string} => {
  const common: Pick<RowProps, 'actionDescription' | 'actionIcon' | 'date'> = {
    actionDescription: translate(`activity.${activity.action}.row_description`),
    actionIcon: actionResultIconMap[activity.action].row,
    date: activity.at,
  };
  switch (activity.action) {
    case DefaultActionSubType.VC_SHARE:
      return {
        id: activity.id,
        title: activity.contactAlias,
        subtitle: activity.shared
          .map(({credential}) => credential?.branding?.alias ?? credential?.title ?? translate('activity.unknown.credential'))
          .join(', '),
        ...common,
      };
    case DefaultActionSubType.VC_SHARE_DECLINE:
      return {
        id: activity.id,
        title: activity.contactAlias,
        ...common,
      };
    case DefaultActionSubType.VC_ISSUE:
    case DefaultActionSubType.VC_ISSUE_DECLINE:
      return {
        id: activity.id,
        title: activity.credential?.branding?.alias ?? activity.credential?.title ?? translate('activity.unknown.credential'),
        ...common,
      };
  }
};

const shareActivitySerializer = <T extends ActivityShareType>(event: ActivityLoggingEvent): IContactCredentialsShareActivity<T> => {
  return {
    id: event.id,
    action: event.actionSubType as T,
    at: event.timestamp,
    result: (event.actionSubType as T) === DefaultActionSubType.VC_SHARE ? ActivityActionResult.SUCCESS : ActivityActionResult.DECLINE,
    contactAlias: event.partyAlias ?? translate('activity.unknown.contact'),
    shared: [
      {
        credential: event.data?.credential,
        info: event.data?.sharedClaims ?? {},
      },
    ],
    purpose: event.sharePurpose ?? translate('activity.unknown.purpose'),
    credentialType: event.credentialType,
  };
};

const issueActivitySerializer = <T extends ActivityIssueType>(event: ActivityLoggingEvent): ICredentialIssuedActivity<T> => ({
  id: event.id,
  action: event.actionSubType as T,
  at: event.timestamp,
  contactAlias: event.partyAlias ?? translate('activity.unknown.issuer'),
  result: (event.actionSubType as T) === DefaultActionSubType.VC_ISSUE ? ActivityActionResult.SUCCESS : ActivityActionResult.DECLINE,
  credential: event.data?.credential,
  info: parseAndValidateJson(event.diagnosticData ?? '{}', isDiagnosticData) ?? {},
});

export const serializeActivity = (event: ActivityLoggingEvent): Activity | undefined => {
  switch (event.actionSubType) {
    case DefaultActionSubType.VC_SHARE:
    case DefaultActionSubType.VC_SHARE_DECLINE:
      return shareActivitySerializer(event);
    case DefaultActionSubType.VC_ISSUE:
    case DefaultActionSubType.VC_ISSUE_DECLINE:
      return issueActivitySerializer(event);
    default:
      console.error(translate('activity.unknown.type'), event);
      return undefined;
  }
};
