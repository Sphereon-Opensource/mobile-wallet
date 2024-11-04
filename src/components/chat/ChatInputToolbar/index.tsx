import React, {useState, useEffect} from 'react';
import {TouchableOpacity, Keyboard, View, TextInput} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';

const ChatInputToolbar = (props: any) => {
  const navigation = useNavigation();

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 30,
        marginHorizontal: moderateScale(10),
        marginBottom: keyboardVisible ? verticalScale(30) : 0,
      }}>
      <TouchableOpacity
        style={{
          marginLeft: 10,
          marginRight: 10,
        }}
        onPress={() => navigation.goBack()}
      />

      <TextInput
        style={{
          flex: 1,
          borderRadius: 30,
          padding: 10,
          backgroundColor: '#E5E5E5',
          marginRight: 10,
        }}
        placeholder="Message"
        placeholderTextColor="#2f3c47"
        autoFocus={true}
        value={inputValue}
        onChangeText={text => setInputValue(text)}
      />

      <TouchableOpacity
        style={{marginLeft: 8}}
        onPress={() => {
          // Logic to send the message
          props.onSend([{text: inputValue}]);
          setInputValue(''); // Clear the input field after sending
        }}
        disabled={!inputValue.trim()}>
        <Ionicons name="arrow-up" size={28} color={inputValue.trim() ? '#2f3c47' : '#ccc'} />
      </TouchableOpacity>
    </View>
  );
};

export default ChatInputToolbar;
