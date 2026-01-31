import {KeyboardAvoidingView as KCKeyboardAvoidingView} from 'react-native-keyboard-controller';
import {ViewProps} from 'react-native';

export type Props = ViewProps & {
  children: React.ReactNode;
  verticalOffset?: number;
  enabled?: boolean;
};

const KeyboardAvoidingView = ({children, verticalOffset = 0, enabled = true, ...rest}: Props) => {
  return (
    <KCKeyboardAvoidingView behavior="padding" keyboardVerticalOffset={verticalOffset} enabled={enabled} {...rest}>
      {children}
    </KCKeyboardAvoidingView>
  );
};

export default KeyboardAvoidingView;
