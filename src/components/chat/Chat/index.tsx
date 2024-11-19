import {useChat} from '../../../providers/chat/ChatProvider-new';
import {useAssistant} from '../../../providers/chat/AssistantProvider';
import ChatButton, {ChatButtonPosition} from '../ChatButton';
import ChatModal from '../ChatModal';
import {useEffect} from 'react';

type Props = {
  buttonPosition?: ChatButtonPosition;
  screenContext?: string;
};

export const Chat = ({buttonPosition, screenContext}: Props) => {
  const {openModal, setMessages} = useChat();
  const {isVoiceRecording, startVoiceRecording, endVoiceRecording, enableVoiceMode, enableTextMode, chatMode, handleChatOpened, sendPrompt, items} =
    useAssistant();

  useEffect(() => {
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

      return {
        _id: item.id,
        text: messageText,
        createdAt: new Date(),
        user: {_id: item.role === 'user' ? 1 : 2}, // _id 1 for user and 2 for assistant
      };
    });
    setMessages(updatedMessages);
  }, [items]);

  const handleSendMessage = (message: string) => {
    sendPrompt(message, screenContext);
  };

  const handleTextPress = () => {
    enableTextMode();
    openModal();
    handleChatOpened(screenContext);
  };

  const handleVoicePress = () => {
    if (chatMode === 'voice') {
      if (isVoiceRecording) {
        endVoiceRecording();
      } else {
        startVoiceRecording();
      }
    } else {
      enableVoiceMode();
    }
  };

  return (
    <>
      <ChatButton position={buttonPosition} onTextPress={handleTextPress} onVoicePress={handleVoicePress} />
      <ChatModal onSendMessage={handleSendMessage} />
    </>
  );
};
