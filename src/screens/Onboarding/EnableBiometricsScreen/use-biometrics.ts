import * as Auth from 'expo-local-authentication';
import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingBiometricsStatus} from '../../../types/machines/onboarding';
import {IUserState} from '../../../types/store/user.types';
import {useSelector} from 'react-redux';
import {RootState} from '../../../types';

export const useBiometrics = () => {
  const authenticateBiometrically = async () => {
    try {
      const strongBiometricsSupported = await getStrongBiometricsSupport();
      if (!strongBiometricsSupported) {
        return false;
      }

      const result = await Auth.authenticateAsync({
        promptMessage: 'Authenticate',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
        biometricsSecurityLevel: 'strong',
      });

      return result.success;
    } catch (error) {
      console.log('Biometric authentication error:', error);
      return false;
    }
  };

  return {
    prompt: authenticateBiometrically,
  };
};

export const useAuthEffect = (effect: (success: boolean) => void) => {
  console.log(`CALLING useAuthEffect`);

  const userState: IUserState = useSelector((state: RootState) => state.user);
  const {onboardingInstance} = useContext(OnboardingContext);
  const biometricsEnabled = useMemo(
    () =>
      onboardingInstance
        ? onboardingInstance.getSnapshot()?.context?.biometricsEnabled === OnboardingBiometricsStatus.ENABLED
        : userState.activeUser?.biometricsEnabled === OnboardingBiometricsStatus.ENABLED,
    [onboardingInstance],
  );

  console.log(`BIOMETRICS enabled: ${biometricsEnabled}`);

  const {prompt} = useBiometrics();

  useEffect(() => {
    if (biometricsEnabled) {
      setTimeout(() => {
        prompt().then(effect);
      }, 1000);
    }
  }, []);
};

const isHardwareSupported = (hasHardware: boolean, supported: Auth.AuthenticationType[]) => {
  const existing = new Map(supported.map(t => [t, true] as const));
  const hasFacial = existing.has(Auth.AuthenticationType.FACIAL_RECOGNITION);
  const hasTouch = existing.has(Auth.AuthenticationType.FINGERPRINT);

  return hasHardware && (hasTouch || hasFacial);
};

type UseHasStringBiometricsOptions = {
  onBiometricsConfirmed?: (isSecure: boolean) => void;
};

const isEnrollmentStrong = (level: Auth.SecurityLevel) => {
  return level === Auth.SecurityLevel.BIOMETRIC_STRONG;
};

const getStrongBiometricsSupport = async () => {
  const {hardware, supported, level} = await getSupportedHardwareContext();
  const hasHardware = isHardwareSupported(hardware, supported);
  const isStrong = isEnrollmentStrong(level);

  return hasHardware && isStrong;
};

const getSupportedHardwareContext = async () => {
  const hardware = await Auth.hasHardwareAsync();
  const supported = await Auth.supportedAuthenticationTypesAsync();
  const enrolled = await Auth.isEnrolledAsync();
  const level = await Auth.getEnrolledLevelAsync();

  return {
    hardware,
    supported,
    enrolled,
    level,
  };
};

export const useHasStrongBiometrics = (options: UseHasStringBiometricsOptions = {}) => {
  const {onBiometricsConfirmed} = options;
  const [hasSupportedHardware, setHasSupportedHardware] = useState(false);
  const [isSecure, setIsSecure] = useState(false);

  const [enrolled, setEnrolled] = useState<boolean>(false);

  const loadSupported = useCallback(async () => {
    const {hardware, supported, enrolled, level} = await getSupportedHardwareContext();

    setEnrolled(enrolled);
    const hasSupportedHardware = isHardwareSupported(hardware, supported);
    setHasSupportedHardware(hasSupportedHardware);
    const isStrong = level === Auth.SecurityLevel.BIOMETRIC_STRONG;
    const isSecure = enrolled && hasSupportedHardware && isStrong;
    setIsSecure(isSecure);

    onBiometricsConfirmed?.(isSecure);
  }, [setHasSupportedHardware, setIsSecure, setEnrolled]);

  useEffect(() => {
    void loadSupported();
  }, []);

  return {
    loadSupported,
    hasHardware: hasSupportedHardware,
    isEnrolled: enrolled,
    isEnrollmentStrong: isSecure,
  };
};
