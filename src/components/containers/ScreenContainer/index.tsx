import {useHeaderHeight} from '@react-navigation/elements';
import {backgroundColors} from '@sphereon/ui-components.core';
import {ReactNode, Ref} from 'react';
import {Platform, ScrollView, StatusBar, View, ViewProps, ViewStyle} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

type Props = {
  children: ReactNode;
  style?: ViewProps['style'];
  footer?: ReactNode;
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
  const headerHeight = useHeaderHeight();
  const bottomOffset = headerHeight + 32;
  return (
    <View
      importantForAccessibility={importantForAccessibility}
      style={{
        flex: 1,
        backgroundColor: backgroundColors.primaryDark,
        paddingBottom: 32 + IOS_EXTRA_BOTTOM_PADDING,
      }}>
      {isAndroid && <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />}
      <KeyboardAwareScrollView
        enabled={!disableKeyboardAvoidingView}
        bottomOffset={bottomOffset}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[contentContainerStyle, {flexGrow: 1}, style]}
        accessible={false}>
        {children}
        {footer && <View style={[{paddingTop: 24, marginTop: 'auto'}, footerStyle]}>{footer}</View>}
      </KeyboardAwareScrollView>
    </View>
  );
};

export default ScreenContainer;
