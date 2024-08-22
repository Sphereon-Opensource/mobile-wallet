import {useContext, useEffect, useMemo} from 'react';
import {ShareContext} from '../../navigation/machines/shareStateNavigation';
import {useBiometrics} from '../Onboarding/EnableBiometricsScreen/use-biometrics';

export const useAuthEffect = (effect: (success: boolean) => void) => {
  const {shareInstance} = useContext(ShareContext);
  const biometricsEnabled = useMemo(() => shareInstance.getSnapshot()?.context?.biometricsEnabled, [shareInstance]);

  const {prompt} = useBiometrics();

  useEffect(() => {
    if (biometricsEnabled) {
      console.log('val', shareInstance.getSnapshot().value);
      prompt().then(effect);
    }
  }, []);
};
