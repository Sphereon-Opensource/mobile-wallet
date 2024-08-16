import * as Auth from 'expo-local-authentication';
import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingBiometricsStatus, OnboardingMachineEvents} from '../../../types/machines/onboarding';

export const useBiometrics = () => {
  const {hasHardware, isEnrollmentStrong, ...rest} = useHasStrongBiometrics();

  const authenticateBiometrically = async () => {
    try {
      if (!hasHardware && !isEnrollmentStrong) {
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
    hasHardware,
    isEnrollmentStrong,
    ...rest,
  };
};

const isHardwareSupported = (hasHardware: boolean, supported: Auth.AuthenticationType[]) => {
  const existing = new Map(supported.map(t => [t, true] as const));
  const hasFacial = existing.has(Auth.AuthenticationType.FACIAL_RECOGNITION);
  const hasTouch = existing.has(Auth.AuthenticationType.FINGERPRINT);

  return hasHardware && (hasTouch || hasFacial);
};

type UseHasStringBiometricsOptions = {
  onBiometricsConfirmed?: () => void;
};

export const useHasStrongBiometrics = (options: UseHasStringBiometricsOptions = {}) => {
  const {onBiometricsConfirmed} = options;
  const [hasSupportedHardware, setHasSupportedHardware] = useState(false);
  const [isSecure, setIsSecure] = useState(false);

  const [enrolled, setEnrolled] = useState<boolean>(false);
  const {onboardingInstance} = useContext(OnboardingContext);

  const loadSupported = useCallback(async () => {
    const hardware = await Auth.hasHardwareAsync();
    const supported = await Auth.supportedAuthenticationTypesAsync();
    const enrolled = await Auth.isEnrolledAsync();
    const level = await Auth.getEnrolledLevelAsync();

    setEnrolled(enrolled);
    const hasSupportedHardware = isHardwareSupported(hardware, supported);
    setHasSupportedHardware(hasSupportedHardware);
    const isStrong = level === Auth.SecurityLevel.BIOMETRIC_STRONG;
    const isSecure = enrolled && hasSupportedHardware && isStrong;
    setIsSecure(isSecure);

    if (!isSecure) onBiometricsConfirmed?.();
  }, [setHasSupportedHardware, setIsSecure, setEnrolled]);

  useEffect(() => {
    loadSupported();
  }, []);

  return {
    loadSupported,
    hasHardware: hasSupportedHardware,
    isEnrolled: enrolled,
    isEnrollmentStrong: isSecure,
  };
};
