import {backgroundColors} from '@sphereon/ui-components.core';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {Button, Keyboard, Modal, View} from 'react-native';
import {GiftedChat, IMessage} from 'react-native-gifted-chat';
import ChatInputToolbar from '../../components/chat/ChatInputToolbar';
import useAIAssistant from '../../hooks/useAIAssistant';

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

  const {isConnected, sendPrompt, updateSession, updateFunctions} = useAIAssistant({onResponse: onSendMessage});

  useEffect((): void => {
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
  }, []);

  const openModal = (): void => {
    setIsVisible(true);
  };

  const closeModal = (): void => {
    setIsVisible(false);
  };

  const renderInputToolbar = (props: any) => {
    console.log('props', props);
    //Add the extra styles via containerStyle
    return <ChatInputToolbar {...props} />;
  };

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
