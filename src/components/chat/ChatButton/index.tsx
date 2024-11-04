import {fontColors} from '@sphereon/ui-components.core';
import {useEffect} from 'react';
import {ViewStyle} from 'react-native';
import {useModal} from '../../../providers/chat/chatProvider';
import {ButtonIconsEnum} from '../../../types';
import SSIIconButton from '../../buttons/SSIIconButton';

type Props = {
  style?: ViewStyle;
};

const ChatButton = ({style}: Props) => {
  const {openModal, updateSession, isConnected, updateFunctions} = useModal();

  useEffect((): void => {
    if (!isConnected) {
      return;
    }

    void updateSession({
      event_id: 'main_event_123',
      type: 'session.update',
      session: {
        modalities: ['text'],
        instructions: `
             `,
        tools: [
          {
            type: 'function',
            name: 'go_back',
            description: 'Return or go back to the previous screen',
            parameters: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            type: 'function',
            name: 'scan_qr',
            description: 'Scan the QR code with the QR scanner',
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
    });

    updateFunctions({
      go_back: () => console.log('navigation.goBack(),'),
      scan_qr: () => console.log("navigation.navigate('AddContact', {})"),
    });
  }, [isConnected]);
  return (
    <SSIIconButton
      style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 50,
        height: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        backgroundColor: 'white',
        ...style,
      }}
      icon={ButtonIconsEnum.CHAT}
      iconSize={30}
      iconColor={fontColors.dark}
      onPress={() => {
        openModal();
      }}
    />
  );
};

export default ChatButton;
