import {useHeaderHeight} from '@react-navigation/elements';
import {backgroundColors} from '@sphereon/ui-components.core';
import {useRef} from 'react';
import {Platform, ScrollView, ScrollViewProps, StatusBar, View, ViewProps, ViewStyle} from 'react-native';
import KeyboardAvoidingView from '../KeyboardAvoidingView';

type Props = {
  children: React.ReactNode;
  style?: ViewProps['style'];
  footer?: React.ReactNode;
  footerStyle?: ViewProps['style'];
  containerStyle?: ViewProps['style'];
  scrollViewPropsWithRef?: (ref: React.RefObject<ScrollView>) => Omit<ScrollViewProps, 'contentContainerStyle'>;
};

const IOS_EXTRA_BOTTOM_PADDING = 16;

export const contentContainerStyle: ViewStyle = {
  paddingHorizontal: 24,
  paddingTop: 0,
};

const defaultContainerStyle: ViewStyle = {
  flex: 1,
  backgroundColor: backgroundColors.primaryDark,
};

const ScreenContainer = ({children, footer, style = {}, footerStyle = {}, containerStyle = {}, scrollViewPropsWithRef = () => ({})}: Props) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const isAndroid = Platform.OS === 'android';
  const isIos = Platform.OS === 'ios';
  const headerHeight = useHeaderHeight();
  const verticalOffset = isIos ? headerHeight + IOS_EXTRA_BOTTOM_PADDING : 0;
  return (
    <View style={[defaultContainerStyle, {paddingBottom: isIos ? 32 + IOS_EXTRA_BOTTOM_PADDING : 32}, containerStyle]}>
      {isAndroid && <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />}
      <KeyboardAvoidingView verticalOffset={verticalOffset} style={{flex: 1}}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[contentContainerStyle, style]}
          {...scrollViewPropsWithRef(scrollViewRef)}>
          {children}
        </ScrollView>
        {footer && <View style={[{paddingHorizontal: 24, paddingTop: 24}, footerStyle]}>{footer}</View>}
      </KeyboardAvoidingView>
    </View>
  );
};

export default ScreenContainer;
