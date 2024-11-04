import {useEffect, useState} from 'react';
import {IMessage} from 'react-native-gifted-chat';
import {v4 as uuidv4} from 'uuid';
import {OPENAI_API_KEY} from 'react-native-dotenv';
import {useSelector} from 'react-redux';
import {RootState} from 'src/types';
import {useNavigation} from '@react-navigation/native';
import RootNavigation, {navigationRef} from '../navigation/rootNavigation';

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
  const [socket, setSocket] = useState<WebSocket>();
  const [functions, setFunctions] = useState<Record<string, any>>({});
  const state = useSelector((state: RootState) => state);
  const navigation = useNavigation();

  useEffect(() => {
    const url = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';

    // @ts-ignore
    const socket = new WebSocket(url, null, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    socket.onopen = (): void => {
      socket.send(
        JSON.stringify({
          event_id: `main_event_123`,
          type: 'session.update',
          session: {
            modalities: ['text'],
            instructions: `
This virtual assistant supports users already inside the credential wallet app, guiding them through adding a digital credential using specific, context-aware prompts that match the user's current position within the app. Each step-by-step instruction is concise and highlights a key term or action to make instructions easy to follow. It provides brief, one-sentence explanations of wallet-related terms on request and responds clearly to any questions.

This is the ideal process of adding a credential to the wallet: To get a VC from an issuer by scanning a QR code.
1. The user scans first the provided QR code from the issuer.
2. Enters the pincode also provided by the issuer.
3. User gets to see the credential that can be added and confirms by clicking "Add"
4. Credential is added.

For each screen the users interaction looks as following:
1. **QR Reader**:
  - The assistant prompts users to scan the QR code displayed by the credential issuer to start the process.
  - The assistant supports users to find find the QR code and instructions on how to scan it if needed.
2. **Contact Review**:
  - Users are prompted to carefully review contact information provided by the issuer
  - A button offers the option to change the alias name of the contact if desired.
  - A button "continue" means that the user acknowledged the displayed information and leads the user to the "Enter Verification Code" Screen.
  - Once the user clicks 'Continue,' the assistant is allowed continuing with assisting in the next step.
3. **Enter Verification Code**:
  - If the QR code requires a verification code, the assistant prompts users to enter the PIN provided by the issuer, with guidance on locating the code if necessary.
  - After entering the PIN correctly, the assistant moves forward.
4. **Credential Details**:
  - Users are encouraged to read through credential details with an option to review associated claims or credential statuses like 'Pending,' 'Active,' or 'Expired.'
  - A button offers the option to change the alias name of the credential if desired.
  - A button 'Add to wallet' means that the users want the displayed information in its wallet and leads the user to the credential overview screen/ Add to wallet confirmation screen
  - Once the user clicks 'Add to wallet,' the assistant is allowed continuing with assisting in the next step.
5. **Add to Wallet Confirmation**:
  - The assistant displays a success message upon completion and offers further guidance as needed.

**Constraints**:
- Avoid technical details unless explicitly requested; keep instructions clear, simple, and relevant.
- Focus exclusively on actions within the app and prioritize security and privacy.
- Keep responses specific to in-app functions without directing users to external apps or steps.
- Address only topics related to the Digital Wallet App.
- Do not provide multiple steps in an answer.
- Limit answers to one sentence. Two sentences are allowed in exceptional cases.
- After the one- or two-sentence answer, you are allowed to offer a list of possible topics for further exploration. E.g.:
  Would you like to know more about:
    1 [topic 1]
    2 [topic 2]
    3 [topic 3]
- if you offer a list of possible topics, also allow space for open questions 

**Guidelines**:
- Use a friendly, helpful tone that matches the user's activity in-app, offering brief, sequential guidance.
- Encourage issuer verification and best practices for secure credential sharing.
- Assume that the user has no technical knowledge

**Clarification**:
- Request additional details if questions are unclear, particularly on multi-step processes or specific credential functions.
            `,
            tools: [
              {
                type: 'function',
                name: 'receive_credential',
                description: 'Simply receive a credential when explicitly requested',
                parameters: {
                  type: 'object',
                  properties: {},
                  required: [],
                },
              },
            ],
            tool_choice: 'auto',
            temperature: 0.8,
          },
        }),
      );
      setSocket(socket);
      setIsConnected(true);
    };

    socket.onerror = (e: Event): void => {
      console.error('WebSocket error:', e);
    };
    socket.onclose = (e: CloseEvent): void => {
      console.log('WebSocket closed:', e.reason);
      setIsConnected(false);
    };

    return (): void => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  useEffect((): void => {
    if (!socket) {
      return;
    }

    socket.onmessage = (e: MessageEvent<any>): void => {
      console.log('onmessage', e.data);
      const data = JSON.parse(e.data);
      // If a function call is found, generate a response because it cannot do both at the same time. The API returns a function call or a response
      if (data.type === 'response.function_call_arguments.done') {
        const event = {
          type: 'response.create',
          response: {
            modalities: ['text'],
            instructions:
              'Tell me that you will begin executing what the user asked. Do not tell me you already did it, tell me that you will begin doing it',
          },
        };
        socket.send(JSON.stringify(event));
        functions[data.name]();
      }

      if (data.type === 'response.text.done' && onResponse) {
        void onResponse([
          {
            _id: uuidv4(),
            text: data.text,
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'Sphereon Assistant',
              avatar: 'https://play-lh.googleusercontent.com/jQme0II-P0joIy0VBanDAY7RyccZvP4c6A7us6t3oGzcnNOvc6KcfS05m7Gq8jUOR-s=w240-h480-rw',
            },
          },
        ]);
      }
      console.log(JSON.parse(e.data.toString()));
    };
  }, [functions]);

  const updateSession = async (session: Record<string, any>): Promise<void> => {
    console.log(`updating session: ${JSON.stringify(session)}`);
    if (!socket || !isConnected) {
      return Promise.reject(Error('Socket not connected'));
    }

    socket.send(JSON.stringify(session));
  };

  const sendPrompt = async (prompt: string): Promise<void> => {
    console.log(`sending prompt: ${prompt}`);
    if (!socket || !isConnected) {
      return Promise.reject(Error('Socket not connected'));
    }

    const route = JSON.stringify(navigationRef?.current?.getCurrentRoute());

    const appState = JSON.stringify(cleanState(state));

    console.log(`appState: ${appState}`);
    console.log(`route: ${route}`);

    const systemEvent = {
      event_id: `context`,
      type: 'session.update',
      session: {
        modalities: ['text'],
        instructions: `
          current app state:
          ${appState}

          current route:
          ${route}
        `,
      },
    };

    const event = {
      type: 'conversation.item.create', // TODO check if we cannot instantly do a  response.create
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: prompt,
          },
        ],
      },
    };
    socket.send(JSON.stringify(systemEvent));
    socket.send(JSON.stringify(event));
    socket.send(JSON.stringify({type: 'response.create'}));
  };

  const updateFunctions = (functions: Record<string, any>): void => {
    setFunctions(functions);
  };

  return {
    isConnected,
    sendPrompt,
    updateSession,
    updateFunctions,
  };
};

export default useAIAssistant;
