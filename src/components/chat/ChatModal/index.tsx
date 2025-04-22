import {Ionicons} from '@expo/vector-icons';
import {fontColors} from '@sphereon/ui-components.core';
import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {Keyboard, Modal, Text, TouchableOpacity, View} from 'react-native';
import {GiftedChat, IMessage} from 'react-native-gifted-chat';
import {useChat} from '../../../providers/chat/chatProvider';
import {ChatBubble} from '../ChatBubble';
import ChatInputToolbar from '../ChatInputToolbar';

type Props = {
  onSendMessage: (message: string) => void;
  onAudioPress: (currentMessage: IMessage) => void;
};

const ChatModal = ({onSendMessage, onAudioPress}: Props) => {
  const {messages, isModalVisible, closeModal} = useChat();

  const handleSendMessage = (newMessages: IMessage[]) => {
    onSendMessage(newMessages[0].text);
  };

  return (
    // <GestureHandlerRootView>
    <Modal transparent visible={isModalVisible} onRequestClose={closeModal} animationType="slide">
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View
          style={{
            marginTop: 'auto',
            position: 'relative',
            width: '100%',
            height: '90%',
            padding: 0,
            paddingBottom: 30,
            backgroundColor: '#ffffff',
            borderTopRightRadius: 32,
            borderTopLeftRadius: 32,
            gap: 20,
          }}>
          <LinearGradient
            colors={['#7276F7', '#7C40E8']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={{
              padding: 16,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={{color: fontColors.light, fontSize: 14, fontWeight: 600}}>Sphereon Digital Assistant</Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={28} color={fontColors.light} />
            </TouchableOpacity>
          </LinearGradient>
          <GiftedChat
            messages={messages}
            onSend={(messages: Array<IMessage>): void => {
              Keyboard.dismiss();
              handleSendMessage(messages);
            }}
            user={{
              _id: 1,
            }}
            messagesContainerStyle={{
              marginHorizontal: 16,
            }}
            showUserAvatar={false}
            renderAvatar={null}
            renderInputToolbar={props => <ChatInputToolbar {...props} />}
            renderBubble={props => <ChatBubble {...props} handleAudioPress={() => onAudioPress(props.currentMessage)} />}
            //   parsePatterns={parsePatterns}
          />
        </View>
      </View>
    </Modal>
    // </GestureHandlerRootView>
  );
};

export default ChatModal;
