import {RealtimeClient, RealtimeUtils} from '@openai/realtime-api-beta';
import {ItemType} from '@openai/realtime-api-beta/dist/lib/client.js';
import {useCallback, useEffect, useRef, useState} from 'react';
import {OPENAI_API_KEY} from 'react-native-dotenv';
import {useSelector} from 'react-redux';
import {ChatTools} from '../components/chat/Chat';
import {basicInstructions, reopenChatPrompt} from '../instructions';
import {translate} from '../localization/Localization';
import rootNavigation, {navigationRef} from '../navigation/rootNavigation';
import {PopupImagesEnum, RootState, ScreenRoutesEnum} from '../types';
import {stringifyState} from '../utils/stringifyState';
import WavRecorder from '../utils/wavtools/WavRecorder';
import WavStreamPlayer from '../utils/wavtools/WavStreamPlayer';

export type ChatMode = 'text' | 'voice';

console.log('==============================');
console.log('OPENAI_API_KEY', process.env.EXPO_OPENAI_API_KEY?.substring(0, 10) ?? OPENAI_API_KEY?.substring(0, 10) ?? 'NOT FOUND!!!', '...');
console.log('==============================');

const useAIAssistant = () => {
  const [isConnected, setIsConnected] = useState(false);
  const state = useSelector((state: RootState) => state);
  const [items, setItems] = useState<ItemType[]>([]);
  const [chatMode, setChatMode] = useState<ChatMode>('text');
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(new WavStreamPlayer());
  const apiKey = process.env.EXPO_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? OPENAI_API_KEY;
/*
  if (!apiKey) {
    throw Error('OPENAI_API_KEY is not set. Chatbot not available');
  }
*/
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient({
      apiKey,
      dangerouslyAllowAPIKeyInBrowser: true,
      debug: false,
    }),
  );

  const startTimeRef = useRef<string>(new Date().toISOString());

  const base64ToArrayBuffer = (base64: string) => {
    const buffer = Buffer.from(base64, 'base64'); // Decode base64
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    return arrayBuffer;
  };

  const appendInputAudio = (base64: string) => {
    console.log('appendInputAudio', base64.length);
    if (base64.length > 0) {
      clientRef.current?.realtime.send('input_audio_buffer.append', {
        audio: base64,
      });
      clientRef.current.inputAudioBuffer = RealtimeUtils.mergeInt16Arrays(clientRef.current.inputAudioBuffer, base64ToArrayBuffer(base64));
    }
    return true;
  };

  const chunkCallback = useCallback(
    (base64: string) => {
      appendInputAudio(base64);
    },
    [clientRef.current],
  );
  const wavRecorderRef = useRef<WavRecorder>(new WavRecorder(chunkCallback));

  const connect = useCallback(async () => {
    const client = clientRef.current;

    // Set state variables
    startTimeRef.current = new Date().toISOString();
    setIsConnected(true);
    setItems(client.conversation.getItems().reverse());
    await client.connect();
  }, []);

  const connectConversation = useCallback(
    async (shouldCreateResponse = true, screenContext?: string) => {
      await connect();

      const client = clientRef.current;
      const wavStreamPlayer = wavStreamPlayerRef.current;

      updateSession({
        screenContext,
        instructions:
          'user has just connected to the conversation. Introduce yourself. Tell the user what you can help them with. Then give information about the current screen. If you have relevant information from the app state, provide it.',
      });

      client.on('error', (event: any) => {
        console.error('REALTIME API ERROR');
        console.error(event);
      });

      client.on('conversation.interrupted', async () => {
        console.log('conversation interrupted');
        const trackSampleOffset = await wavStreamPlayer.interrupt();
        if (trackSampleOffset?.trackId) {
          const {trackId, offset} = trackSampleOffset;
          client.cancelResponse(trackId, offset);
        }
      });

      client.on('conversation.updated', async ({item, delta}: any) => {
        // console.log('conversation updated with status' + item.status);
        const items = client.conversation.getItems();
        if (item.status === 'completed') {
          setItems(items.reverse().filter(item => item.type !== 'function_call'));
          if (item.role === 'user') {
            await wavStreamPlayer.interrupt();
          }
        } else {
          // can decrease to debounce
          if (Math.random() < 1) {
            setItems(items.reverse().filter(item => item.type !== 'function_call'));
          }
        }
      });

      client.on('response.created', async ({response}: any) => {
        console.log('response created', '\n', JSON.stringify(response, null, 2), 'response.created');
      });

      const navigateHandleSocketError = async (args: any): Promise<void> => {
        const {navigation, context} = args;

        if (!context.error) {
          throw new Error(`Missing error in context`);
        }

        navigation.navigate(ScreenRoutesEnum.ERROR, {
          image: PopupImagesEnum.WARNING,
          title: context.error.title,
          details: context.error.message,
          ...(context.error.detailsMessage && {
            detailsPopup: {
              buttonCaption: translate('action_view_extra_details'),
              title: context.error.detailsTitle,
              details: context.error.detailsMessage,
            },
          }),
          primaryButton: {
            caption: translate('action_ok_label'),
            accessibilityLabel: `${translate('action_ok_label')}.`,
            onPress: () => navigation.goBack(),
          },
          onBack: () => navigation.goBack(),
        });
      };
      client.realtime.ws.addEventListener('message', (event: any) => {
        const message = JSON.parse(event.data);
        if (message.type === 'response.done') {
          const {response} = message;
          if (response?.status === 'failed') {
            let errorMessage = (response.status_details?.error?.message ??
              response.status_details?.error?.code ??
              'An unknown error occurred.') as string;
            if (errorMessage.match(/.*(Limit[^.]+).*(Please try[^.]+).*/)) {
              errorMessage = errorMessage?.replace(/.*(Limit[^.]+).*(Please try[^.]+.[^.]+).*/, `Rate limit reached: $1. $2`);
            }

            navigateHandleSocketError({
              navigation: rootNavigation,
              context: {
                error: {
                  title: 'An error occurred.',
                  message: errorMessage,
                  detailsMessage: `The assistant it using Beta technology from OpenAI. Unfortunately they are applying rate limits at present, meaning we cannot always interact and currently there is no way to increase those limits. These limits are applied across all wallets collectively. If you limit voice input and output you are less likely to hit the rate limits`,
                },
              },
            });
          }
        }
      });

      setItems(client.conversation.getItems().reverse());

      if (shouldCreateResponse) {
        client.createResponse();
      }
    },
    [state],
  );

  const connectVoice = useCallback(async () => {
    console.log('connecting voice');
    await connect();
    const wavRecorder = wavRecorderRef.current;
    wavRecorder.begin();
    updateSession({
      instructions:
        'user has just enabled voice mode, which can be toggled with the microphone button in the bottom right corner of the screen. Instruct user if necessary.',
    });
    clientRef.current.createResponse();
  }, []);

  const disconnectConversation = useCallback(async () => {
    console.log('disconnecting conversation');
    setIsConnected(false);
    setItems([]);

    const client = clientRef.current;
    client.disconnect();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    wavStreamPlayer.interrupt();
  }, []);

  useEffect(() => {
    return () => {
      console.log('resetting convo');
      // cleanup; resets to defaults
      const client = clientRef.current;
      client.reset();
    };
  }, []);

  const updateSession = ({screenContext, instructions}: {screenContext?: string; instructions?: string}) => {
    const client = clientRef.current;

    const route = stringifyState(navigationRef?.current?.getCurrentRoute() || {});

    const appState = stringifyState(state);

    console.log('appState', appState);
    console.log('route', route);

    client.updateSession({
      input_audio_transcription: {model: 'whisper-1'},
      instructions: `
          # general instructions:
          ${basicInstructions}

          # current app state:
          ${appState}
  
          # current route:
          ${route}

          # current onscreen context:
          ${screenContext || 'unknown'}
  
          # specific instructions for current context:
          ${instructions || ''}
        `,
    });
  };

  const sendPrompt = async (prompt: string, screenContext?: string): Promise<void> => {
    // console.log('sendPrompt (connected: ' + isConnected + ")", prompt);
    if (!isConnected) {
      await connectConversation(false);
    }

    updateSession({screenContext});
    try {
      const out = clientRef.current.sendUserMessageContent([{type: 'input_text', text: prompt}]);
    } catch (error: any) {
      console.log(`Update session error ${error.message}`);
      console.error(error);
      if (error?.message?.includes('is not connected') == true) {
        console.log('reconnecting');
        try {
          clientRef.current.disconnect();
          clientRef.current.reset();
        } finally {
          setIsConnected(false);
        }
        await connect();
        await sendPrompt(prompt, screenContext);
      }
    }
  };

  const enableVoiceMode = () => {
    setChatMode('voice');
    connectVoice();
  };

  const enableTextMode = () => {
    setChatMode('text');
  };

  const handleChatOpened = (screenContext?: string) => {
    if (!isConnected) {
      connectConversation(true, screenContext);
    } else {
      // workaround for re-opening chat. Using createResponse would create a new response based on the previous prompt.
      // This message will be hidden based on the content. Slightly ugly, but it works.
      sendPrompt(reopenChatPrompt, screenContext);
    }
  };

  const speakMessage = async (int16Array: Int16Array) => {
    wavStreamPlayerRef.current.add16BitPCM(int16Array, 'assistant-audio');
  };

  const addTools = (tools: ChatTools) =>
    tools?.forEach(({tool, callback}) => {
      clientRef.current.addTool(tool, callback);
    });

  const removeTools = (tools: ChatTools) =>
    tools?.forEach(({tool}) => {
      try {
        clientRef.current.removeTool(tool.name);
      } catch (e) {
        console.log(e);
      }
    });

  const sendAudio = async (audio: string) => {
    if (!isConnected) {
      await connectConversation(false);
    }
    clientRef.current?.realtime.send('input_audio_buffer.append', {audio});
    clientRef.current?.realtime.send('input_audio_buffer.commit', {});

    clientRef.current.createResponse();
  };

  return {
    isConnected,
    sendPrompt,
    updateSession,
    connectConversation,
    disconnectConversation,
    chatMode,
    enableVoiceMode,
    enableTextMode,
    items,
    wavStreamPlayer: wavStreamPlayerRef.current,
    addTools,
    removeTools,
    handleChatOpened,
    speakMessage,
    sendAudio,
  };
};

export default useAIAssistant;
