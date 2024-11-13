import {backgroundColors} from '@sphereon/ui-components.core';
import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {Button, Keyboard, Modal, View, Text} from 'react-native';
import {GiftedChat, IMessage} from 'react-native-gifted-chat';
import ChatInputToolbar from '../../components/chat/ChatInputToolbar';
import useAIAssistant from '../../hooks/useAIAssistant';
import {TouchableOpacity} from 'react-native-gesture-handler';
import WavStreamPlayer from 'src/utils/wavtools/WavStreamPlayer';

type ModalContextType = {
  isConnected: boolean;
  openModal: () => void;
  closeModal: () => void;
  updateSession: (session: Record<string, any>) => Promise<void>;
  updateFunctions: (functions: Record<string, any>) => void;
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

  const onSendMessage = (newMessages: Array<IMessage> = []): void => {
    // @ts-ignore
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
  };

  const {isConnected, sendPrompt, updateSession, updateFunctions, connectConversation, disconnectConversation, items, wavStreamPlayer} =
    useAIAssistant({
      onResponse: onSendMessage,
    });

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
    setMessages([
      {
        _id: 1,
        text: 'Hello! How can I assist you today?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Sphereon Assistant',
          avatar: 'https://play-lh.googleusercontent.com/jQme0II-P0joIy0VBanDAY7RyccZvP4c6A7us6t3oGzcnNOvc6KcfS05m7Gq8jUOR-s=w240-h480-rw',
        },
      },
    ]);
    connectConversation();
    return () => {
      disconnectConversation();
    };
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
    setIsVisible(true);
  };

  const closeModal = (): void => {
    setIsVisible(false);
  };

  const renderInputToolbar = (props: any) => {
    //Add the extra styles via containerStyle
    return <ChatInputToolbar {...props} />;
  };

  const handleLongPress = useCallback(
    (context: unknown, currentMessage: any) => {
      console.log('long press', currentMessage);
      // find item with id and use wavplayerrecorder.playpcmarray with formatted.file

      const item = items.find(({id}) => id === currentMessage._id);
      console.log('item', item?.id);
      wavStreamPlayer.playWavBase64String(item?.formatted.file);
    },
    [items],
  );

  return (
    <ModalContext.Provider value={{openModal, closeModal, updateSession, isConnected, updateFunctions}}>
      {children}
      <Modal transparent visible={isVisible} onRequestClose={closeModal} animationType="slide">
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View
            style={{
              marginTop: 'auto',
              position: 'relative',
              width: '100%',
              height: 600,
              padding: 0,
              paddingBottom: 30,
              backgroundColor: '#ffffff',
              borderTopRightRadius: 32,
              borderTopLeftRadius: 32,
              gap: 20,
            }}>
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
              renderInputToolbar={renderInputToolbar}
              parsePatterns={parsePatterns}
              onLongPress={handleLongPress}
            />
            <View
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
              }}>
              <Button onPress={closeModal} title="Close" color="#C65102" />
            </View>
          </View>
        </View>
      </Modal>
    </ModalContext.Provider>
  );
};
