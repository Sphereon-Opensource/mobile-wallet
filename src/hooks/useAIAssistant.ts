import {decode, encode} from 'base-64';

globalThis.atob = decode;
globalThis.btoa = encode;

import {RealtimeClient, RealtimeUtils} from '@openai/realtime-api-beta';
import {ItemType} from '@openai/realtime-api-beta/dist/lib/client.js';
import {useCallback, useEffect, useRef, useState} from 'react';
import {OPENAI_API_KEY} from 'react-native-dotenv';
import {useSelector} from 'react-redux';
import {RootState} from 'src/types';
import {basicInstructions} from '../instructions';
import {navigationRef} from '../navigation/rootNavigation';
import WavRecorder from '../utils/wavtools/WavRecorder';
import WavStreamPlayer from '../utils/wavtools/WavStreamPlayer';

interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: {[key: string]: any};
}

export type ChatMode = 'text' | 'voice';

const cleanState = (state: RootState) => {
  let newState = {...state};
  const clean = (obj: any) => {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        newObj[key] = obj[key].map((item: any) => {
          if (typeof item === 'object') {
            return clean(item);
          }
          return item;
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        newObj[key] = clean(obj[key]);
      } else if (!(typeof obj[key] === 'string' && obj[key].startsWith('data:'))) {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  };

  return clean(newState);
};

const useAIAssistant = () => {
  const [isConnected, setIsConnected] = useState(false);
  const state = useSelector((state: RootState) => state);
  const [items, setItems] = useState<ItemType[]>([]);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('text');
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(new WavStreamPlayer());
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowAPIKeyInBrowser: true,
    }),
  );
  const startTimeRef = useRef<string>(new Date().toISOString());

  /**
   * Converts a base64 string to an ArrayBuffer
   * @param {string} base64
   * @returns {ArrayBuffer}
   */
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

  const connectConversation = useCallback(async () => {
    await connect();

    const client = clientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    client.updateSession({
      instructions: basicInstructions + '\n' + 'user has just connected to the conversation. Introduce yourself.',
    });

    // client.addTool(basicTools[0], (result: any) => {
    //   console.log('tool result', result);
    //   switch (result.route) {
    //     case 'QR_READER':
    //       // navigation.navigate(ScreenRoutesEnum.QR_READER);
    //       break;
    //   }
    // });

    client.on('error', (event: any) => console.error(event));
    client.on('conversation.interrupted', async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const {trackId, offset} = trackSampleOffset;
        client.cancelResponse(trackId, offset);
      }
    });
    client.on('conversation.updated', async ({item, delta}: any) => {
      const items = client.conversation.getItems();
      if (delta?.audio && chatMode === 'voice') {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      setItems(items.reverse().filter(item => item.type !== 'function_call'));
    });

    client.on('conversation.item.completed', ({item}: any) => {
      console.log('conversation item completed', '\n', item.type, 'conversation.item.completed');
      if (item.type === 'function_call') {
        // your function call is complete, execute some custom code
        console.log('function call completed', '\n', JSON.stringify(item, null, 2), 'conversation.item.completed');
      }
    });

    client.on('response.created', async ({response}: any) => {
      console.log('response created', '\n', JSON.stringify(response, null, 2), 'response.created');
    });

    setItems(client.conversation.getItems().reverse());

    client.createResponse();

    //   client.sendUserMessageContent([
    //     {
    //       type: `input_text`,
    //       text: `Hello!`,
    //       // text: `For testing purposes, I want you to list ten car brands. Number each item, e.g. "one (or whatever number you are one): the item name".`
    //     },
    //   ]);
    // }, []);
  }, []);

  const connectVoice = useCallback(async () => {
    console.log('connecting voice');
    await connect();
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const route = JSON.stringify(navigationRef?.current?.getCurrentRoute());
    const appState = JSON.stringify(cleanState(state));

    wavRecorder.begin();

    client.updateSession({
      instructions: `
        # basic instructions:
        ${basicInstructions}

        # current app state:
        ${appState}

        # current route:
        ${route}

        user has just enabled voice mode, which can be toggled with the microphone button in the bottom right corner of the screen. Instruct user if necessary.
      `,
    });

    client.sendUserMessageContent([{type: 'input_text', text: 'explain how voice mode works'}]);

    console.log('connected voice');
  }, []);

  const disconnectConversation = useCallback(async () => {
    setIsConnected(false);
    setItems([]);

    const client = clientRef.current;
    client.disconnect();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    wavStreamPlayer.interrupt();
  }, []);

  const deleteConversationItem = useCallback(async (id: string) => {
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

  useEffect(() => {
    return () => {
      console.log('resetting convo');
      // cleanup; resets to defaults
      const client = clientRef.current;
      client.reset();
    };
  }, []);

  const updateSession = async (session: Record<string, any>): Promise<void> => {
    // console.log(`updating session: ${JSON.stringify(session)}`, 'updateSession');
    clientRef.current.updateSession(session);
  };

  const sendPrompt = async (prompt: string): Promise<void> => {
    // console.log(`sending prompt: ${prompt}`);

    const route = JSON.stringify(navigationRef?.current?.getCurrentRoute());

    const appState = JSON.stringify(cleanState(state));

    clientRef.current.updateSession({
      instructions: `
        # basic instructions:
        ${basicInstructions}

        # current app state:
        ${appState}

        # current route:
        ${route}
      `,
    });
    clientRef.current.sendUserMessageContent([{type: 'input_text', text: prompt}]);
  };
  const startVoiceRecording = async () => {
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.startRecording();
    setIsVoiceRecording(true);
  };

  const endVoiceRecording = async () => {
    setIsVoiceRecording(false);
    const wavRecorder = wavRecorderRef.current;
    const client = clientRef.current;
    const filePath = await wavRecorder.stopRecording();
    // if (!base64) return;
    // const int16Array = RealtimeUtils.base64ToArrayBuffer(base64);
    // // console.log('int16Array', int16Array);
    // // if (!int16Array) return;

    // // wavStreamPlayerRef.current.add16BitPCM(int16Array, 'user-audio');

    // // make chunks of 2400 samples
    // const chunkSize = 2400;
    // const chunks = [];
    // for (let i = 0; i < int16Array.byteLength; i += chunkSize) {
    //   chunks.push(int16Array.slice(i, i + chunkSize));
    // }
    // chunks.forEach(chunk => {
    // client.appendInputAudio(chunk);
    // });

    client.createResponse();
  };
  const enableVoiceMode = () => {
    setChatMode('voice');
    connectVoice();
  };

  const enableTextMode = () => {
    setChatMode('text');
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
    isVoiceRecording,
    startVoiceRecording,
    endVoiceRecording,
    items,
    wavStreamPlayer: wavStreamPlayerRef.current,
    addTool: clientRef.current.addTool,
    removeTool: clientRef.current.removeTool,
  };
};

export default useAIAssistant;
