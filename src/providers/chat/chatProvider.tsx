import React, {createContext, useContext, useState, useCallback} from 'react';
import {IMessage} from 'react-native-gifted-chat';

type ChatContextType = {
  messages: IMessage[];
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
  openModal: () => void;
  closeModal: () => void;
  isModalVisible: boolean;
  showChatButton: (position?: ChatButtonPosition) => void;
  hideChatButton: () => void;
  isChatButtonVisible: boolean;
  chatButtonPosition: ChatButtonPosition;
};

type ChatButtonPosition = {
  bottom: number;
  right: number;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isChatButtonVisible, setIsChatButtonVisible] = useState(true);
  const [chatButtonPosition, setChatButtonPosition] = useState<ChatButtonPosition>({bottom: 16, right: 16});

  const openModal = useCallback(() => {
    console.log('openModal');
    setIsModalVisible(true);
  }, []);
  const closeModal = useCallback(() => setIsModalVisible(false), []);
  const showChatButton = useCallback((position?: ChatButtonPosition) => {
    setIsChatButtonVisible(true);
    if (position) {
      setChatButtonPosition(position);
    }
  }, []);
  const hideChatButton = useCallback(() => setIsChatButtonVisible(false), []);

  return (
    <ChatContext.Provider
      value={{messages, setMessages, openModal, closeModal, isModalVisible, showChatButton, hideChatButton, isChatButtonVisible, chatButtonPosition}}>
      {children}
    </ChatContext.Provider>
  );
};
