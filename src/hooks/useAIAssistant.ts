import {RealtimeClient} from '@openai/realtime-api-beta';
import {ItemType} from '@openai/realtime-api-beta/dist/lib/client.js';
import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import {OPENAI_API_KEY} from 'react-native-dotenv';
import {IMessage} from 'react-native-gifted-chat';
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

export type Props = {
  onResponse?: (newMessages: Array<IMessage>) => void;
};

const useAIAssistant = (props: Props) => {
  const {onResponse} = props;
  const [isConnected, setIsConnected] = useState(false);
  const [functions, setFunctions] = useState<Record<string, any>>({});
  const state = useSelector((state: RootState) => state);
  const navigation = useNavigation();

  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});
  const [items, setItems] = useState<ItemType[]>([]);

  const wavRecorderRef = useRef<WavRecorder>(new WavRecorder());
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(new WavStreamPlayer());
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowAPIKeyInBrowser: true,
    }),
  );
  const startTimeRef = useRef<string>(new Date().toISOString());

  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    // Set state variables
    startTimeRef.current = new Date().toISOString();
    setIsConnected(true);
    setRealtimeEvents([]);
    setItems(client.conversation.getItems());

    // Connect to microphone
    await wavRecorder.begin();

    // Connect to realtime API
    await client.connect();
    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hello!`,
        // text: `For testing purposes, I want you to list ten car brands. Number each item, e.g. "one (or whatever number you are one): the item name".`
      },
    ]);

    if (client.getTurnDetectionType() === 'server_vad') {
      // console.log('server vad');
      await wavRecorder.record((data: any) => client.appendInputAudio(data.mono));
    }
  }, []);

  const disconnectConversation = useCallback(async () => {
    setIsConnected(false);
    setRealtimeEvents([]);
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

  /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    // Set instructions
    client.updateSession({instructions: basicInstructions});
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({input_audio_transcription: {model: 'whisper-1'}});

    // handle realtime events from client + server for event logging
    client.on('realtime.event', (realtimeEvent: RealtimeEvent) => {
      // // console.log('realtime event', '\n', JSON.stringify(realtimeEvent, null, 2));
      // console.log('realtime event', '\n', JSON.stringify(realtimeEvent, null, 2), `type: ${realtimeEvent.event.type}`);
      setRealtimeEvents(realtimeEvents => {
        const lastEvent = realtimeEvents[realtimeEvents.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          // if we receive multiple events in a row, aggregate them for display purposes
          lastEvent.count = (lastEvent.count || 0) + 1;
          return realtimeEvents.slice(0, -1).concat(lastEvent);
        } else {
          return realtimeEvents.concat(realtimeEvent);
        }
      });
    });
    client.on('error', (event: any) => console.error(event));
    client.on('conversation.interrupted', async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const {trackId, offset} = trackSampleOffset;
        client.cancelResponse(trackId, offset);
      }
    });
    client.on('conversation.updated', async ({item, delta}: any) => {
      console.log('conversation updated', '\n', JSON.stringify({...item, formatted: {...item.formatted, audio: 'omitted'}}, null, 2));
      // console.log('conversation updated', item.id, delta?.audio?.length, 'conversation.updated');
      const items = client.conversation.getItems();
      if (delta?.audio) {
        // wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === 'completed' && item.formatted.audio?.length) {
        wavStreamPlayer.play16BitPCMArray(item.formatted.audio);
      }
      setItems(items);
    });

    client.on('response.created', async ({response}: any) => {
      // console.log('response created', '\n', JSON.stringify(response, null, 2), 'response.created');
    });

    setItems(client.conversation.getItems());

    return () => {
      // cleanup; resets to defaults
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

  const updateFunctions = (functions: Record<string, any>): void => {
    setFunctions(functions);
  };

  const startVoiceRecording = async () => {};

  const endVoiceRecording = () => {};

  return {
    isConnected,
    sendPrompt,
    updateSession,
    updateFunctions,
    connectConversation,
    disconnectConversation,
    items,
    wavStreamPlayer: wavStreamPlayerRef.current,
  };
};

export default useAIAssistant;
