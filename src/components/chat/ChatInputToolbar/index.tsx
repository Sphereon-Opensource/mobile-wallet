import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {fontColors} from '@sphereon/ui-components.core';
import React, {useEffect, useState} from 'react';
import {Keyboard, TextInput, TouchableOpacity, View} from 'react-native';
import {verticalScale} from 'react-native-size-matters';
import {useAssistant} from '../../../providers/chat/AssistantProvider';
import {useRealtimeRecording} from '../../../hooks/useRealtimeRecording';

const ChatInputToolbar = (props: any) => {
  const {sendAudio} = useAssistant();
  const navigation = useNavigation();

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const {recording, startRecording, stopRecording} = useRealtimeRecording({
    onData: data => {
      try {
        sendAudio(data);
      } catch (err) {
        console.error('Failed to send audio', err);
      }
    },
  });

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

  const handleVoicePress = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: keyboardVisible ? verticalScale(30) : 0,
      }}>
      <TouchableOpacity style={{}} onPress={() => navigation.goBack()} />

      <TextInput
        style={{
          flex: 1,
          padding: 10,
          borderWidth: 1,
          borderColor: '#C4C5CA',
          borderRadius: 8,
          height: 50,
        }}
        multiline={true}
        placeholder="Type or speak your message"
        placeholderTextColor="#2f3c47"
        value={inputValue}
        onChangeText={text => setInputValue(text)}
      />
      {!keyboardVisible && (
        <TouchableOpacity
          style={{marginLeft: 8}}
          onPress={() => {
            handleVoicePress();
          }}>
          <Ionicons name={recording ? 'stop-circle-outline' : 'mic-outline'} size={28} color={recording ? '#D74500' : fontColors.dark} />
        </TouchableOpacity>
      )}
      {keyboardVisible && (
        <TouchableOpacity
          style={{position: 'absolute', right: 0, bottom: 0, height: 50, width: 50, display: 'flex', justifyContent: 'center', alignItems: 'center'}}
          onPress={() => {
            // Logic to send the message
            props.onSend([{text: inputValue}]);
            setInputValue(''); // Clear the input field after sending
          }}
          disabled={!inputValue.trim()}>
          <Ionicons name="arrow-up-outline" size={24} color={fontColors.dark} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ChatInputToolbar;
