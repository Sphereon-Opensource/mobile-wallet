import {Audio} from 'expo-av';
// import {FFmpegKit} from 'ffmpeg-kit-react-native';
import {useState} from 'react';
import RNFS from 'react-native-fs';

export type Props = {
  onData: (base64data: string) => void;
};

export const useRealtimeRecording = ({onData}: Props) => {
  const [recording, setRecording] = useState<Audio.Recording>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const {recording} = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.LOW_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setRecording(undefined);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording?.getURI();
    if (!uri) {
      throw new Error('No recording URI found');
    }
   /* const out = await convertTo24kHzMono(uri);
    const outputData = await RNFS.readFile(out, 'base64');
    onData(outputData);*/
  };

  // FIXME: Disable audio recording, because FFMpeg react0native discontinued project and pulled all binaries, leaving a mess for implementer
  /*const convertTo24kHzMono = async (inputPath: string) => {
    const outputPath = `${RNFS.DocumentDirectoryPath}/converted_audio.pcm`;
    const command = `-y -i ${inputPath} -ar 24000 -ac 1 -f s16le ${outputPath}`;
    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();
    if (!returnCode.isValueSuccess()) {
      console.error('Conversion failed with return code:', returnCode);
      throw new Error('Conversion failed');
    }
    return outputPath;
  };*/

  return {
    recording,

    startRecording,
    stopRecording,
  };
};
