import {useHeaderHeight} from '@react-navigation/elements';
import {backgroundColors} from '@sphereon/ui-components.core';
import {Platform, ScrollView, ScrollViewProps, StatusBar, View, ViewProps} from 'react-native';
import KeyboardAvoidingView from '../KeyboardAvoidingView';

type Props = {
  children: React.ReactNode;
  style?: ViewProps['style'];
  headerAvailable?: boolean;
};

const IOS_EXTRA_BOTTOM_PADDING = 16;

export const contentContainerStyle: ScrollViewProps['contentContainerStyle'] = {
  paddingHorizontal: 24,
  paddingBottom: Platform.OS === 'ios' ? IOS_EXTRA_BOTTOM_PADDING + 32 : 32,
  paddingTop: 0,
  flex: 1,
};

const ScreenContainer = ({children, style = {}, headerAvailable = true}: Props) => {
  const isAndroid = Platform.OS === 'android';
  const isIos = Platform.OS === 'ios';
  const headerHeight = useHeaderHeight();
  const verticalOffset = isIos ? headerHeight - IOS_EXTRA_BOTTOM_PADDING : 0;
  return (
    <View style={{flex: 1, backgroundColor: backgroundColors.primaryDark}}>
      {isAndroid && <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />}
      <KeyboardAvoidingView verticalOffset={verticalOffset} style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={[contentContainerStyle, style]}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ScreenContainer;
