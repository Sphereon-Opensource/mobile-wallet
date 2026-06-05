import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {CredentialStateType} from '@sphereon/ssi-sdk.data-store-types';
import {Alert} from 'react-native';
import {translate} from '../localization/Localization';

export const countProblematic = (creds: Array<UniqueDigitalCredential>): {revoked: number; expired: number; suspended: number; untrusted: number} => {
  let revoked = 0;
  let expired = 0;
  let suspended = 0;
  let untrusted = 0;
  for (const c of creds) {
    const state = c?.digitalCredential?.verifiedState;
    if (state === CredentialStateType.REVOKED) revoked++;
    else if (state === CredentialStateType.EXPIRED) expired++;
    else if (state === CredentialStateType.SUSPENDED) suspended++;
    else if (state === CredentialStateType.UNTRUSTED) untrusted++;
  }
  return {revoked, expired, suspended, untrusted};
};

/**
 * If any of the selected credentials is revoked/expired/suspended/untrusted, shows a confirmation alert
 * warning that the presentation is likely to fail (or shares a credential the wallet can't vouch for) and
 * only proceeds when the user confirms. Returns true when a warning was shown (so the caller must NOT
 * proceed itself), or false when there's nothing to warn about (the caller should proceed immediately).
 * Untrusted is included specifically to protect the user from sharing a credential whose status — and thus
 * whose issuer — the wallet could not authenticate (e.g. one received from a rogue actor).
 */
export const warnIfRevokedOrExpired = (creds: Array<UniqueDigitalCredential>, onProceed: () => void | Promise<void>): boolean => {
  const {revoked, expired, suspended, untrusted} = countProblematic(creds);
  if (revoked === 0 && expired === 0 && suspended === 0 && untrusted === 0) {
    return false;
  }

  const reasons: Array<string> = [];
  if (revoked > 0) reasons.push(translate('credential_status_badge_revoked').toLowerCase());
  if (expired > 0) reasons.push(translate('credential_status_badge_expired').toLowerCase());
  if (suspended > 0) reasons.push(translate('credential_status_badge_suspended').toLowerCase());
  if (untrusted > 0) reasons.push(translate('credential_status_badge_untrusted').toLowerCase());

  const details = `${translate('presentation_status_warning_details_prefix')} ${reasons.join(
    ` ${translate('presentation_status_warning_and')} `,
  )}. ${translate('presentation_status_warning_details_suffix')}`;

  Alert.alert(translate('presentation_status_warning_title'), details, [
    {text: translate('action_cancel_label'), style: 'cancel'},
    {
      text: translate('presentation_status_warning_proceed'),
      style: 'destructive',
      onPress: () => {
        void onProceed();
      },
    },
  ]);
  return true;
};
