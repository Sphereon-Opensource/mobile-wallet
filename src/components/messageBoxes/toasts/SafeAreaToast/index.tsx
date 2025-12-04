import React from 'react';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {toastConfig, toastsAutoHide, toastsVisibilityTime} from '../../../../@config/toasts';

export const SafeAreaToast = () => {
  const insets = useSafeAreaInsets();

  // 1. Get bottom inset (Android Navigation Bar)
  // 2. Default to 48 (standard Android nav height) if inset is 0 to prevent initial overlapping
  // 3. Add 16 extra padding so it doesn't sit exactly on the bar
  const safeBottomOffset = (Platform.OS === 'android'
    ? Math.max(insets.bottom, 48)
    : insets.bottom
  ) + 16;

  return (
      <Toast
        position="bottom"
      bottomOffset={safeBottomOffset} // <--- The fix applies here
        topOffset={0}
        autoHide={toastsAutoHide}
        visibilityTime={toastsVisibilityTime}
        config={toastConfig}
      />
  );
};
