import React, {useEffect} from 'react';
import {View, Platform} from 'react-native'; // Import View and Platform
import {ToastConfigParams} from 'react-native-toast-message';
import {useSafeAreaInsets} from 'react-native-safe-area-context'; // Import hook

import SSIToast from '../../components/messageBoxes/toasts/SSIToast';
import {useAccessibility} from '../../hooks/useAccessibility';
import {IToastCustomProps, ToastTypeEnum} from '../../types';

// Helper component to wrap toast with safe area logic
const SafeToastWrapper = ({children}: {children: React.ReactNode}) => {
  const insets = useSafeAreaInsets();

  // Calculate margin: Inset + 10px spacing
  // If Edge-to-Edge is working, insets.bottom should be ~48 on Android
  const bottomMargin = Platform.OS === 'android' ? Math.max(insets.bottom, 48) + 10 : insets.bottom + 10;

  return (
    <View style={{marginBottom: bottomMargin}}>
      {children}
    </View>
  );
};

export const toastsAutoHide = true;
export const toastsVisibilityTime = 6000;

export const toastConfig = {
  ssiAlertToastSuccess: (params: ToastConfigParams<IToastCustomProps>) => {
    const {text1, text2} = params;
    const {showBadge = true} = params.props;
    const {announce} = useAccessibility();
    useEffect(() => {
      announce({message: `Success: ${text1 ?? ''} ${text2 ?? ''}`});
    }, []);

    // Wrap the SSIToast
    return (
      <SafeToastWrapper>
        <SSIToast type={ToastTypeEnum.TOAST_SUCCESS} title={text1} message={text2} showBadge={showBadge} />
      </SafeToastWrapper>
    );
  },
  ssiAlertToastError: (params: ToastConfigParams<IToastCustomProps>) => {
    const {text1, text2} = params;
    const {showBadge = true} = params.props;
    const {announce} = useAccessibility();
    useEffect(() => {
      announce({message: `Error: ${text1 ?? ''} ${text2 ?? ''}`});
    }, []);

    // Wrap the SSIToast
    return (
      <SafeToastWrapper>
        <SSIToast type={ToastTypeEnum.TOAST_ERROR} title={text1} message={text2} showBadge={showBadge} />
      </SafeToastWrapper>
    );
  },
};
