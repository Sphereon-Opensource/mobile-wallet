import {Ionicons} from '@expo/vector-icons';
import {fontColors} from '@sphereon/ui-components.core';
import React, {useEffect} from 'react';
import {TouchableOpacity, View, ViewStyle} from 'react-native';
import {useModal} from '../../../providers/chat/chatProvider';

type Props = {
  style?: ViewStyle;
};

const ChatButton = ({style}: Props) => {
  const {openModal, updateSession, isConnected, updateFunctions} = useModal();

  useEffect((): void => {
    if (!isConnected) {
      return;
    }

    // void updateSession({
    //   event_id: 'main_event_123',
    //   type: 'session.update',
    //   session: {
    //     modalities: ['text'],
    //     instructions: `
    //          `,
    //     tools: [
    //       {
    //         type: 'function',
    //         name: 'go_back',
    //         description: 'Return or go back to the previous screen',
    //         parameters: {
    //           type: 'object',
    //           properties: {},
    //           required: [],
    //         },
    //       },
    //       {
    //         type: 'function',
    //         name: 'scan_qr',
    //         description: 'Scan the QR code with the QR scanner',
    //         parameters: {
    //           type: 'object',
    //           properties: {},
    //           required: [],
    //         },
    //       },
    //     ],
    //     tool_choice: 'auto',
    //     temperature: 0.8,
    //   },
    // });

    updateFunctions({
      go_back: () => console.log('navigation.goBack(),'),
      scan_qr: () => console.log("navigation.navigate('AddContact', {})"),
    });
  }, [isConnected]);
  return (
    <View
      style={{
        ...style,
      }}>
      <TouchableOpacity
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
        }}
        onPress={() => {
          openModal();
        }}>
        <Ionicons name="chatbubble-outline" size={28} color={fontColors.dark} />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 76,
          right: 16,
          width: 50,
          height: 50,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 25,
          backgroundColor: 'white',
        }}
        onPress={() => {
          openModal();
        }}>
        <Ionicons name="mic-outline" size={28} color={fontColors.dark} />
      </TouchableOpacity>
    </View>
  );
};

export default ChatButton;
