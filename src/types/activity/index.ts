import {CredentialType} from '@sphereon/ssi-sdk.core';
import {DefaultActionSubType} from '@sphereon/ssi-types';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';

export enum CredentialActivityAction {
  ISSUE = 'ISSUE',
  DELETE = 'DELETE',
  VERIFY = 'VERIFY',
}

export enum ContactActivityAction {
  SHARE = 'SHARE',
  FIRST_INTERACTION = 'FIRST_INTERACTION',
}

export enum ActivityActionResult {
  SUCCESS = 'SUCCESS',
  DECLINE = 'DECLINE',
}

export type ActivityShareType = DefaultActionSubType.VC_SHARE | DefaultActionSubType.VC_SHARE_DECLINE;

export type ActivityIssueType = DefaultActionSubType.VC_ISSUE | DefaultActionSubType.VC_ISSUE_DECLINE;

export type ActivityType = ActivityShareType | ActivityIssueType;

export type BaseActivity = {
  id: string;
  at: Date;
  result: ActivityActionResult;
  contactAlias: string;
};

export type Info = Record<string, any> //FIXME Record<string, string | number | boolean>

export type ICredentialIssuedActivity<T extends ActivityIssueType> = BaseActivity & {
  action: T;
  credential?: CredentialSummary;
  info: Info;
};

export type IContactCredentialsShareActivity<T extends ActivityShareType> = BaseActivity & {
  action: T;
  shared: {
    credential?: CredentialSummary;
    info: Info;
  }[];
  purpose: string;
  // This should probably be tied to each shared block and handled accordingly in the ui
  credentialType?: CredentialType;
};

export type Activity =
  | IContactCredentialsShareActivity<DefaultActionSubType.VC_SHARE>
  | IContactCredentialsShareActivity<DefaultActionSubType.VC_SHARE_DECLINE>
  | ICredentialIssuedActivity<DefaultActionSubType.VC_ISSUE>
  | ICredentialIssuedActivity<DefaultActionSubType.VC_ISSUE_DECLINE>;
