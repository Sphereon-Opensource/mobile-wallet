import {KeyboardAvoidingViewProps, PlatformOSType, KeyboardAvoidingView as RNKeyboardAvoidingView} from 'react-native';

export type Props = KeyboardAvoidingViewProps & {
  children: React.ReactNode;
  verticalOffset?: number;
  activeOn?: PlatformOSType[];
};

const KeyboardAvoidingView = ({children, verticalOffset = 0, activeOn = ['ios'], ...rest}: Props) => {
  return (
    <RNKeyboardAvoidingView behavior="padding" keyboardVerticalOffset={verticalOffset} {...rest}>
      {children}
    </RNKeyboardAvoidingView>
  );
};

export default KeyboardAvoidingView;
