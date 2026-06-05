import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {CredentialStateType} from '@sphereon/ssi-sdk.data-store-types';
import {Alert} from 'react-native';
import {translate} from '../localization/Localization';

export const countRevokedExpired = (creds: Array<UniqueDigitalCredential>): {revoked: number; expired: number} => {
  let revoked = 0;
  let expired = 0;
  for (const c of creds) {
    const state = c?.digitalCredential?.verifiedState;
    if (state === CredentialStateType.REVOKED) revoked++;
    else if (state === CredentialStateType.EXPIRED) expired++;
  }
  return {revoked, expired};
};

/**
 * If any of the selected credentials is revoked/expired, shows a confirmation alert warning that
 * the presentation is likely to fail and only proceeds when the user confirms. Returns true when a
 * warning was shown (so the caller must NOT proceed itself), or false when there's nothing to warn
 * about (the caller should proceed immediately).
 */
export const warnIfRevokedOrExpired = (creds: Array<UniqueDigitalCredential>, onProceed: () => void | Promise<void>): boolean => {
  const {revoked, expired} = countRevokedExpired(creds);
  if (revoked === 0 && expired === 0) {
    return false;
  }

  const reasons: Array<string> = [];
  if (revoked > 0) reasons.push(translate('credential_status_badge_revoked').toLowerCase());
  if (expired > 0) reasons.push(translate('credential_status_badge_expired').toLowerCase());

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
