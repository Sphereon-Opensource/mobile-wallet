import {useChat} from '../../../providers/chat/ChatProvider';
import {useAssistant} from '../../../providers/chat/AssistantProvider';
import ChatButton, {ChatButtonPosition} from '../ChatButton';
import ChatModal from '../ChatModal';
import {useEffect, useMemo} from 'react';
import {ToolDefinitionType} from '@openai/realtime-api-beta/dist/lib/client';
import {IMessage} from 'react-native-gifted-chat';

export type ChatTools = {tool: ToolDefinitionType; callback: (args: unknown) => void}[];

type Props = {
  buttonPosition?: ChatButtonPosition;
  screenContext?: string;
  tools?: ChatTools;
};

export const Chat = ({buttonPosition, screenContext, tools}: Props) => {
  const {openModal, setMessages} = useChat();
  const {
    isVoiceRecording,
    startVoiceRecording,
    endVoiceRecording,
    enableVoiceMode,
    enableTextMode,
    chatMode,
    handleChatOpened,
    sendPrompt,
    items,
    addTool,
    removeTool,
    speakMessage,
  } = useAssistant();

  useEffect(() => {
    tools?.forEach(({tool, callback}) => {
      addTool(tool, callback);
    });
    return () => {
      tools?.forEach(({tool}) => {
        removeTool(tool.name);
      });
    };
  }, [tools]);

  useEffect(() => {
    const updatedMessages = items
      .map(item => {
        let messageText = '';

        if (item.type === 'function_call_output') return;

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
        } else if (item.role === 'assistant') {
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
      })
      .filter(item => !!item);
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

  const handleAudioPress = (message: IMessage) => {
    console.log('handleAudioPress', message);
    const item = items.find(({id}) => id === message._id);
    if (item?.formatted.audio) {
      console.log('Playing audio', item.formatted.audio.length);
      speakMessage(item?.formatted.audio);
    }
  };

  return (
    <>
      <ChatButton position={buttonPosition} onTextPress={handleTextPress} onVoicePress={handleVoicePress} />
      <ChatModal onSendMessage={handleSendMessage} onAudioPress={handleAudioPress} />
    </>
  );
};
