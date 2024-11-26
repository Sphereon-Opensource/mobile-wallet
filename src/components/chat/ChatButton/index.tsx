import {Ionicons} from '@expo/vector-icons';
import {fontColors} from '@sphereon/ui-components.core';
import React, {useEffect} from 'react';
import {TouchableOpacity, View, ViewStyle} from 'react-native';
import {useChat} from '../../../providers/chat/chatProvider';
import {useAssistant} from '../../../providers/chat/AssistantProvider';
import {LinearGradient} from 'expo-linear-gradient';

export type ChatButtonPosition = {
  bottom: number;
  right: number;
};

type Props = {
  style?: ViewStyle;
  position?: ChatButtonPosition;
  onVoicePress: () => void;
  onTextPress: () => void;
};

const ChatButton = ({style, position, onVoicePress, onTextPress}: Props) => {
  const {isVoiceRecording, chatMode} = useAssistant();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: position ? position.bottom : 16,
        right: position ? position.right : 16,
        alignItems: 'center',
        ...style,
      }}>
      <TouchableOpacity
        style={{
          width: chatMode === 'text' ? 56 : 32,
          height: chatMode === 'text' ? 56 : 32,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: chatMode === 'text' ? 56 / 2 : 32 / 2,
          backgroundColor: chatMode === 'text' ? 'white' : '#585e73',
          marginBottom: 8,
        }}
        onPress={() => {
          onTextPress();
        }}>
        <Ionicons name="chatbubble-outline" size={chatMode === 'text' ? 28 : 18} color={chatMode === 'text' ? fontColors.dark : fontColors.light} />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          width: chatMode === 'voice' ? 56 : 32,
          height: chatMode === 'voice' ? 56 : 32,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: chatMode === 'voice' ? 56 / 2 : 32 / 2,
          backgroundColor: chatMode === 'voice' ? 'white' : '#585e73',
          overflow: 'hidden',
          position: 'relative',
        }}
        onPress={() => {
          onVoicePress();
        }}>
        {isVoiceRecording && (
          <LinearGradient
            colors={['#C6FFFA', '#B3B5FF']}
            start={[0, 0]}
            end={[1, 1]}
            style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}}
          />
        )}
        <Ionicons name="mic-outline" size={chatMode === 'voice' ? 28 : 18} color={chatMode === 'voice' ? fontColors.dark : fontColors.light} />
      </TouchableOpacity>
    </View>
  );
};

export default ChatButton;
