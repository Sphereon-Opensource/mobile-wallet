import FingerprintScanner from 'react-native-fingerprint-scanner';

import {translate} from '../localization/Localization';

export const scanFingerPrint = async () => {
  return FingerprintScanner.authenticate({
    title: translate('biometrics_title'),
  })
    .then(() => {
      FingerprintScanner.release();
    })
    .catch((error: Error) => {
      FingerprintScanner.release();
      return Promise.reject(error);
    });
};

// TODO
// we should use this to catch the canceling of a fingerprint
// .catch(error => {
//   if (!/UserCancel|UserFallback|SystemCancel/.test(error.name)) {
//     console.error('Error', error);
//   }
// });
