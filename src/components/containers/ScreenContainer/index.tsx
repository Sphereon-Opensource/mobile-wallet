import {useHeaderHeight} from '@react-navigation/elements';
import {backgroundColors} from '@sphereon/ui-components.core';
import {Platform, ScrollView, StatusBar, View, ViewProps, ViewStyle} from 'react-native';
import KeyboardAvoidingView from '../KeyboardAvoidingView';

type Props = {
  children: React.ReactNode;
  style?: ViewProps['style'];
  footer?: React.ReactNode;
  footerStyle?: ViewProps['style'];
  disableKeyboardAvoidingView?: boolean;
};

const IOS_EXTRA_BOTTOM_PADDING = 16;

export const contentContainerStyle: ViewStyle = {
  paddingHorizontal: 24,
  paddingTop: 0,
};

const ScreenContainer = ({children, footer, style = {}, footerStyle = {}, disableKeyboardAvoidingView = false}: Props) => {
  const isAndroid = Platform.OS === 'android';
  const isIos = Platform.OS === 'ios';
  const headerHeight = useHeaderHeight();
  const verticalOffset = isIos ? headerHeight + IOS_EXTRA_BOTTOM_PADDING : 0;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: backgroundColors.primaryDark,
        paddingBottom: isIos ? 32 + IOS_EXTRA_BOTTOM_PADDING : 32,
      }}>
      {isAndroid && <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />}
      <KeyboardAvoidingView enabled={!disableKeyboardAvoidingView} verticalOffset={verticalOffset} style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={[contentContainerStyle, style]}>
          {children}
        </ScrollView>
        {footer && <View style={[{paddingHorizontal: 24, paddingTop: 24}, footerStyle]}>{footer}</View>}
      </KeyboardAvoidingView>
    </View>
  );
};

export default ScreenContainer;
