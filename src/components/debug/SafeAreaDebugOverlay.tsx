import React from 'react';
import {View, Text, Dimensions, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/**
 * Debug overlay to show safe area insets and screen dimensions
 * Place this component at the root level to see what safe areas are being reported
 */
export const SafeAreaDebugOverlay = () => {
  const insets = useSafeAreaInsets();
  const {width, height} = Dimensions.get('window');
  const screenDimensions = Dimensions.get('screen');

  React.useEffect(() => {
    console.log('=== SAFE AREA DEBUG ===');
    console.log('Platform:', Platform.OS);
    console.log('Safe Area Insets:', {
      top: insets.top,
      right: insets.right,
      bottom: insets.bottom,
      left: insets.left,
    });
    console.log('Window dimensions:', {width, height});
    console.log('Screen dimensions:', {width: screenDimensions.width, height: screenDimensions.height});
    console.log('======================');
  }, [insets.top, insets.right, insets.bottom, insets.left, width, height]);

  return (
    <>
      {/* Top safe area border */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: 'rgba(255, 0, 0, 0.3)',
          borderBottomWidth: 3,
          borderBottomColor: 'red',
          zIndex: 9999,
        }}
      />

      {/* Bottom safe area border */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: insets.bottom,
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
          borderTopWidth: 5,
          borderTopColor: 'red',
          zIndex: 9999,
        }}
      />

      {/* Left safe area border */}
      {insets.left > 0 && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: insets.left,
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            borderRightWidth: 3,
            borderRightColor: 'red',
            zIndex: 9999,
          }}
        />
      )}

      {/* Right safe area border */}
      {insets.right > 0 && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: insets.right,
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            borderLeftWidth: 3,
            borderLeftColor: 'red',
            zIndex: 9999,
          }}
        />
      )}

      {/* Debug text overlay - REMOVED FOR BETTER VISIBILITY */}
    </>
  );
};
