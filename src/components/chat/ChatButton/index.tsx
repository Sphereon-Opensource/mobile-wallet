import {Ionicons} from '@expo/vector-icons';
import {fontColors} from '@sphereon/ui-components.core';
import React from 'react';
import {TouchableOpacity, View, ViewStyle} from 'react-native';
import {useAssistant} from '../../../providers/chat/AssistantProvider';

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

const ChatButton = ({style, position, onTextPress}: Props) => {
  const {chatMode} = useAssistant();

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
    </View>
  );
};

export default ChatButton;
