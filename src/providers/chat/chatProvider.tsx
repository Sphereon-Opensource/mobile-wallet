import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {Text, Keyboard, Modal, TouchableOpacity, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {GiftedChat, IMessage} from 'react-native-gifted-chat';
import {ChatBubble} from '../../components/chat/ChatBubble';
import ChatInputToolbar from '../../components/chat/ChatInputToolbar';
import useAIAssistant from '../../hooks/useAIAssistant';
import {LinearGradient} from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import ChatButton from '../../components/chat/ChatButton';

type ModalContextType = {
  openModal: () => void;
  closeModal: () => void;
  showChatButton: (position?: {bottom: number; right: number}) => void;
  hideChatButton: () => void;
  assistant: ReturnType<typeof useAIAssistant>;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }

  return context;
};

export const ChatProvider = ({children}: {children: any}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Array<IMessage>>([]);
  const [isChatButtonVisible, setIsChatButtonVisible] = useState(false);
  const [chatButtonPosition, setChatButtonPosition] = useState({bottom: 16, right: 16});

  const onSendMessage = (newMessages: Array<IMessage> = []): void => {
    // @ts-ignore
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
  };

  const assistant = useAIAssistant();
  const {sendPrompt, connectConversation, items, wavStreamPlayer} = assistant;

  const parsePatterns = useCallback(() => {
    return [
      {
        pattern: /\[Audio Available\]/, // looks for string [Audio Available]
        style: {textDecorationLine: 'underline', color: 'darkorange'},
        onPress: (e: any, ...args: any) => console.log('clicked on [Audio Available]', e, args),
      },
    ];
  }, []);

  useEffect(() => {
    // console.log('items', '\n', JSON.stringify(items, null, 2));

    const updatedMessages = items.map(item => {
      let messageText = '';

      // Check if it's a tool message
      if (item.formatted.tool) {
        messageText = `${item.formatted.tool.name} (${item.formatted.tool.arguments})`;
      }
      // Check if it's a user message without a tool
      else if (item.role === 'user') {
        if (item.formatted.transcript) {
          messageText = item.formatted.transcript;
        } else if (item.formatted.audio?.length) {
          messageText = '(awaiting transcript)';
        } else {
          messageText = item.formatted.text || '(item sent)';
        }
      }
      // Check if it's an assistant message without a tool
      else if (item.role === 'assistant') {
        if (item.formatted.transcript) {
          messageText = item.formatted.transcript;
        } else {
          messageText = item.formatted.text || '(truncated)';
        }
      }
      // Check if there's a file
      if (item.formatted.file) {
        messageText = `${messageText} [Audio Available]`; // Optionally add a marker for audio
      }

      return {
        _id: item.id,
        text: messageText,
        createdAt: new Date(),
        user: {_id: item.role === 'user' ? 1 : 2}, // Assuming _id 1 for user and 2 for assistant
      };
    });
    setMessages(updatedMessages);
  }, [items]);

  const openModal = (): void => {
    connectConversation();
    setIsVisible(true);
  };

  const closeModal = (): void => {
    setIsVisible(false);
  };

  const handleAudioPress = useCallback(
    (message: IMessage) => {
      // find item with id and use wavplayerrecorder.playpcmarray with formatted.file

      const item = items.find(({id}) => id === message._id);
      if (!item || !item.formatted.audio) return;
      console.log('item', item?.id);
      wavStreamPlayer.add16BitPCM(item.formatted.audio, item.id);
    },
    [items],
  );

  const showChatButton = useCallback((position?: {bottom: number; right: number}) => {
    setIsChatButtonVisible(true);
    if (position) {
      setChatButtonPosition(position);
    }
  }, []);

  const hideChatButton = useCallback(() => {
    setIsChatButtonVisible(false);
  }, []);

  return (
    <ModalContext.Provider value={{openModal, closeModal, showChatButton, hideChatButton, assistant}}>
      <GestureHandlerRootView>
        {children}
        {isChatButtonVisible && <ChatButton />}
        <Modal transparent visible={isVisible} onRequestClose={closeModal} animationType="slide">
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
                  onSendMessage(messages);
                  sendPrompt(messages[0].text);
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
                renderBubble={props => <ChatBubble {...props} handleAudioPress={() => handleAudioPress(props.currentMessage)} />}
                parsePatterns={parsePatterns}
              />
            </View>
          </View>
        </Modal>
      </GestureHandlerRootView>
    </ModalContext.Provider>
  );
};
