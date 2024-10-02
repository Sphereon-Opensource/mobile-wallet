import * as Auth from 'expo-local-authentication';
import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {OnboardingContext} from '../navigation/machines/onboardingStateNavigation';
import {OnboardingBiometricsStatus} from '../types/machines/onboarding';
import {IUserState} from '../types/store/user.types';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../types';
import {setBiometrics} from '../store/actions/user.actions';

export const useBiometricsEnabledContext = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const userState: IUserState = useSelector((state: RootState) => state.user);

  const enabled = useMemo(() => {
    const walletBiometricsEnabled = userState.users.values().next().value.biometricsEnabled === OnboardingBiometricsStatus.ENABLED;
    return (
      walletBiometricsEnabled ||
      (onboardingInstance
        ? onboardingInstance.getSnapshot()?.context?.biometricsEnabled === OnboardingBiometricsStatus.ENABLED
        : userState.activeUser?.biometricsEnabled === OnboardingBiometricsStatus.ENABLED)
    );
  }, [onboardingInstance, userState]);

  return enabled;
};

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
        fallbackLabel: 'Try again later',
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

type UseAuthEffectOptions = {
  /**
   * The number of milliseconds to delay the authorization
   * prompt after the hook is mounted.
   */
  promptDelay?: number;
};
type AuthEffectCallback = ((success: boolean) => void) | ((success: boolean) => Promise<void>);
export const useAuthEffect = (effect: AuthEffectCallback) => {
  const biometricsEnabled = useBiometricsEnabledContext();

  const {prompt} = useBiometrics();

  useEffect(() => {
    if (biometricsEnabled) {
      prompt().then(async (result: boolean) => {
        await effect(result);
      });
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

export const useEnableBiometrics = () => {
  const {prompt} = useBiometrics();
  const {activeUser} = useSelector((state: RootState) => state.user);
  const isEnabled = useMemo(() => {
    if (!activeUser) return false;
    const {biometricsEnabled} = activeUser;
    return biometricsEnabled === OnboardingBiometricsStatus.ENABLED;
  }, [activeUser]);
  const dispatch = useDispatch();

  const enable = async () => {
    if (isEnabled) return console.log('biometrics already enabled!');
    return prompt().then(success => {
      if (success) return dispatch(setBiometrics(OnboardingBiometricsStatus.ENABLED));
      console.log('failed to enable biometrics');
    });
  };

  const disable = () => {
    if (!isEnabled) return console.log('biometrics not enabled!');
    dispatch(setBiometrics(OnboardingBiometricsStatus.DISABLED));
  };

  return {
    disable,
    enable,
    isEnabled,
  };
};
