import {ActivityLoggingEvent} from '@sphereon/ssi-sdk.core';
import {DefaultActionSubType} from '@sphereon/ssi-types';

import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import {translate} from '../localization/Localization';
import {
  Activity,
  ActivityActionResult,
  ActivityIssueType,
  ActivityShareType,
  IContactCredentialsShareActivity,
  ICredentialIssuedActivity,
} from '../types';
import {parseAndValidateJson} from './json';
import {isDiagnosticData} from './validate';

const shareActivitySerializer = <T extends ActivityShareType>(
  event: ActivityLoggingEvent,
  credential?: CredentialSummary,
): IContactCredentialsShareActivity<T> => ({
  id: event.id,
  action: event.actionSubType as T,
  at: event.timestamp,
  result: (event.actionSubType as T) === DefaultActionSubType.VC_SHARE ? ActivityActionResult.SUCCESS : ActivityActionResult.DECLINE,
  contactAlias: event.partyAlias ?? translate('activity.unknown.contact'),
  shared: [
    {
      credential,
      info: parseAndValidateJson(event.diagnosticData ?? '{}', isDiagnosticData) ?? {},
    },
  ],
  purpose: event.sharePurpose ?? translate('activity.unknown.purpose'),
  credentialType: event.credentialType,
});

const issueActivitySerializer = <T extends ActivityIssueType>(
  event: ActivityLoggingEvent,
  credential?: CredentialSummary,
): ICredentialIssuedActivity<T> => ({
  id: event.id,
  action: event.actionSubType as T,
  at: event.timestamp,
  contactAlias: event.partyAlias ?? translate('activity.unknown.issuer'),
  result: (event.actionSubType as T) === DefaultActionSubType.VC_ISSUE ? ActivityActionResult.SUCCESS : ActivityActionResult.DECLINE,
  credential,
  info: parseAndValidateJson(event.diagnosticData ?? '{}', isDiagnosticData) ?? {},
});

export const serializeActivity = (event: ActivityLoggingEvent, credential?: CredentialSummary): Activity | undefined => {
  switch (event.actionSubType) {
    case DefaultActionSubType.VC_SHARE:
    case DefaultActionSubType.VC_SHARE_DECLINE:
      return shareActivitySerializer(event, credential);
    case DefaultActionSubType.VC_ISSUE:
    case DefaultActionSubType.VC_ISSUE_DECLINE:
      return issueActivitySerializer(event, credential);
    default:
      console.error(translate('activity.unknown.type'), event);
      return undefined;
  }
};
