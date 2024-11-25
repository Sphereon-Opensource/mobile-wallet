import {useHeaderHeight} from '@react-navigation/elements';
import {backgroundColors} from '@sphereon/ui-components.core';
import {Ref} from 'react';
import {Platform, ScrollView, StatusBar, View, ViewProps, ViewStyle} from 'react-native';
import KeyboardAvoidingView from '../KeyboardAvoidingView';

type Props = {
  children: React.ReactNode;
  style?: ViewProps['style'];
  footer?: React.ReactNode;
  footerStyle?: ViewProps['style'];
  disableKeyboardAvoidingView?: boolean;
  scrollViewRef?: Ref<ScrollView>;
  importantForAccessibility?: ViewProps['importantForAccessibility'];
};

export const IOS_EXTRA_BOTTOM_PADDING = 16;

export const contentContainerStyle: ViewStyle = {
  paddingHorizontal: 24,
  paddingTop: 0,
};

const ScreenContainer = ({
  children,
  footer,
  style = {},
  footerStyle = {},
  disableKeyboardAvoidingView = false,
  scrollViewRef,
  importantForAccessibility = 'yes',
}: Props) => {
  const isAndroid = Platform.OS === 'android';
  const isIos = Platform.OS === 'ios';
  const headerHeight = useHeaderHeight();
  const verticalOffset = isIos ? headerHeight + 32 : 0;
  return (
    <View
      importantForAccessibility={importantForAccessibility}
      style={{
        flex: 1,
        backgroundColor: backgroundColors.primaryDark,
        paddingBottom: 32 + IOS_EXTRA_BOTTOM_PADDING,
      }}>
      {isAndroid && <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />}
      <KeyboardAvoidingView enabled={!disableKeyboardAvoidingView} verticalOffset={verticalOffset} style={{flex: 1}} importantForAccessibility="no">
        <ScrollView
          importantForAccessibility="no"
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[contentContainerStyle, style]}
          accessible={false}>
          {children}
        </ScrollView>
        {footer && <View style={[{paddingHorizontal: 24, paddingTop: 24}, footerStyle]}>{footer}</View>}
      </KeyboardAvoidingView>
    </View>
  );
};

export default ScreenContainer;
