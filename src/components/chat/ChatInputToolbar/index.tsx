import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {fontColors} from '@sphereon/ui-components.core';
import {Audio} from 'expo-av';
import {FFmpegKit} from 'ffmpeg-kit-react-native';
import React, {useEffect, useState} from 'react';
import {Keyboard, TextInput, TouchableOpacity, View} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import {verticalScale} from 'react-native-size-matters';
import {useAssistant} from '../../../providers/chat/AssistantProvider';
import {useChat} from '../../../providers/chat/chatProvider';

const audioRecorderPlayer = new AudioRecorderPlayer();

const ChatInputToolbar = (props: any) => {
  const {closeModal} = useChat();
  const {enableVoiceMode, sendAudio} = useAssistant();
  const navigation = useNavigation();

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const [recording, setRecording] = useState<Audio.Recording>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const {recording} = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync(
      {
        allowsRecordingIOS: false,
      }
    );
    const uri = recording?.getURI();
    console.log('Recording stopped and stored at', uri);
    // console.log(await RNFS.readFile(uri))
    const out = await convertTo24kHzMono(uri)
    sendAudioToAPI(out)
  }

  const convertTo24kHzMono = async (inputPath: string) => {
    console.log({inputPath})
    const file = await RNFS.readFile(inputPath, 'base64');
    console.log(file)
    const outputPath = `${RNFS.DocumentDirectoryPath}/converted_audio.pcm`;
    const command = `-y -i ${inputPath} -ar 24000 -ac 1 -f s16le ${outputPath}`;

    const session = await FFmpegKit.execute(command)
    const returnCode = await session.getReturnCode();
    if (returnCode.isValueSuccess()) {
      console.log('Conversion successful:', outputPath);
    } else {
      console.error('Conversion failed with return code:', returnCode);
      throw new Error('Conversion failed');
    }
    return outputPath;
  };

  // Encode PCM data to base64 and send to the API
  const sendAudioToAPI = async (path: string) => {
    try {
      const fileData = await RNFS.readFile(path, 'base64');
      await sendAudio(fileData);
    } catch (error) {
      console.error('Error sending audio:', error);
    }
  };


  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleVoicePress = () => {
    console.log('Voice Pressed');
    if (recording) {
      stopRecording()
    } else {
      startRecording();
    }
    // closeModal();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: keyboardVisible ? verticalScale(30) : 0,
      }}>
      <TouchableOpacity style={{}} onPress={() => navigation.goBack()} />

      <TextInput
        style={{
          flex: 1,
          padding: 10,
          backgroundColor: '#E5E5E5',
          height: keyboardVisible ? 100 : 50,
        }}
        multiline={true}
        placeholder="Message"
        placeholderTextColor="#2f3c47"
        value={inputValue}
        onChangeText={text => setInputValue(text)}
      />
      {!keyboardVisible && (
        <TouchableOpacity
          style={{marginLeft: 8}}
          onPress={() => {
            handleVoicePress();
          }}>
          <Ionicons
            name={recording ? 'stop-circle-outline' : 'mic-outline'}
            size={28}
            color={recording ? '#D74500' : fontColors.dark}
          />
        </TouchableOpacity>
      )}
      {keyboardVisible && (
        <TouchableOpacity
          style={{position: 'absolute', right: 0, bottom: 0, padding: 8}}
          onPress={() => {
            // Logic to send the message
            props.onSend([{text: inputValue}]);
            setInputValue(''); // Clear the input field after sending
          }}
          disabled={!inputValue.trim()}>
          <Ionicons name="arrow-up-outline" size={24} color={fontColors.dark} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ChatInputToolbar;
