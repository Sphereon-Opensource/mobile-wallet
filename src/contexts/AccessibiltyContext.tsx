import {Dispatch, ReactNode, RefObject, SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {AccessibilityInfo, findNodeHandle} from 'react-native';

export type AnnounceOptions = {
  message: string;
  queue?: boolean;
  delay?: number;
};

type SetFocus = (ref: RefObject<any>, delay?: number) => void;
type AnnounceWithOptions = (options: AnnounceOptions) => void;

export type AccessibilityContent = {
  isScreenReaderEnabled: boolean;
  setFocus: SetFocus;
  announce: AnnounceWithOptions;
  setIsScreenReaderEnabled: Dispatch<SetStateAction<boolean>>;
};

export const AccessibilityContext = createContext<AccessibilityContent>({
  isScreenReaderEnabled: false,
  setFocus: _options => {},
  announce: _options => {},
  setIsScreenReaderEnabled: () => {},
});

export const useAccessibilityContext = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({children}: {children: ReactNode}) => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  const updateScreenReaderStatus = async (isActive: boolean) => {
    setIsScreenReaderEnabled(isActive);
  };

  const setFocus = useCallback<SetFocus>((ref, delay) => {
    const reactTag = findNodeHandle(ref.current);
    if (reactTag) {
      if (delay) {
        setTimeout(() => {
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        }, delay);
      } else {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }
  }, []);

  const announce: AnnounceWithOptions = ({message, queue = false, delay}) => {
    if (delay) {
      setTimeout(() => AccessibilityInfo.announceForAccessibilityWithOptions(message, {queue}), delay);
    } else {
      AccessibilityInfo.announceForAccessibilityWithOptions(message, {queue});
    }
  };

  useEffect(() => {
    const screenReaderChangedSubscription = AccessibilityInfo.addEventListener('screenReaderChanged', isScreenReaderEnabled => {
      setIsScreenReaderEnabled(isScreenReaderEnabled);
    });

    AccessibilityInfo.isScreenReaderEnabled().then(isScreenReaderEnabled => {
      setIsScreenReaderEnabled(isScreenReaderEnabled);
    });

    return () => {
      screenReaderChangedSubscription.remove();
    };
  }, []);

  const value = useMemo(
    () => ({
      isScreenReaderEnabled,
      setFocus,
      announce,
      setIsScreenReaderEnabled,
    }),
    [isScreenReaderEnabled],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
};
