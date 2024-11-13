import AudioRecorderPlayer, {AVEncodingOption} from 'react-native-audio-recorder-player';
import {Platform} from 'react-native';
import * as FileSystem from 'expo-file-system';
import WavPacker from './WavPacker';
import {Buffer} from 'buffer';
import {PERMISSIONS, request, check, RESULTS} from 'react-native-permissions';

global.Buffer = Buffer;

const audioRecorderPlayer = new AudioRecorderPlayer();

class WavRecorder {
  recorder: AudioRecorderPlayer;
  recordPath: string;
  isRecording: boolean;
  chunkInterval: NodeJS.Timeout | undefined;

  constructor() {
    this.recorder = audioRecorderPlayer;
    this.recordPath = `${FileSystem.documentDirectory}audio_temp.raw`; // Temporary raw recording
    this.isRecording = false;
    this.chunkInterval = undefined;
  }

  /**
   * Begins a recording session and requests microphone permissions if not already granted.
   * @returns {Promise<boolean>} True if the recording session successfully begins.
   */
  async begin(): Promise<boolean> {
    try {
      // Request permissions using react-native-permissions
      const permissionType = Platform.OS === 'android' ? PERMISSIONS.ANDROID.RECORD_AUDIO : PERMISSIONS.IOS.MICROPHONE;

      const permissionStatus = await check(permissionType);

      if (permissionStatus === RESULTS.DENIED || permissionStatus === RESULTS.BLOCKED || permissionStatus === RESULTS.UNAVAILABLE) {
        const requestResult = await request(permissionType);
        if (requestResult !== RESULTS.GRANTED) {
          throw new Error('Microphone permission denied');
        }
      } else if (permissionStatus !== RESULTS.GRANTED) {
        throw new Error('Microphone permission not granted');
      }

      // Check if we are already recording
      if (this.isRecording) {
        throw new Error('Already connected: please call .end() to start a new session');
      }
    } catch (error) {
      console.error('Error starting recording session:', error);
      return false;
    }
    return true;
  }

  async startRecording(): Promise<boolean> {
    try {
      // Start recording in a raw PCM format
      await this.recorder.startRecorder(this.recordPath, {
        AVFormatIDKeyIOS: AVEncodingOption.lpcm, // iOS format option
      });

      // console.log('Recording started...');
      this.isRecording = true;

      return true;
    } catch (error) {
      console.error('Error starting recording session:', error);
      return false;
    }
  }

  async stopRecording(): Promise<string | undefined> {
    try {
      if (!this.isRecording) {
        throw new Error('Recording session has not started');
      }

      const result = await this.recorder.stopRecorder();
      // console.log('Recording stopped, result:', result, 'stopped');
      this.isRecording = false;

      if (this.chunkInterval) {
        clearInterval(this.chunkInterval);
        this.chunkInterval = undefined;
      }

      // Load raw PCM audio data
      const audioData: string = await FileSystem.readAsStringAsync(this.recordPath, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const rawArray: Float32Array = this.base64ToFloat32Array(audioData); // Converting from Base64 to Float32Array

      // Convert to WAV
      const wavArrayBuffer: ArrayBuffer = WavPacker.float32ToWav(rawArray);

      // Save WAV file
      const wavPath: string = `${FileSystem.documentDirectory}final_audio.wav`;

      // Convert ArrayBuffer to Base64 before writing
      const wavBase64String: string = Buffer.from(wavArrayBuffer).toString('base64');
      await FileSystem.writeAsStringAsync(wavPath, wavBase64String, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // console.log(`WAV file saved at ${wavPath}`);
      return wavPath;
    } catch (error) {
      console.error('Error stopping recorder:', error);
    }
  }

  base64ToFloat32Array(base64Data: WithImplicitCoercion<string>): Float32Array {
    // Simple utility to convert from base64 string to Float32Array
    const rawData: Buffer = Buffer.from(base64Data, 'base64');
    const float32Array: Float32Array = new Float32Array(rawData.buffer);
    return float32Array;
  }

  /**
   * Records audio in chunks and invokes a callback with each audio chunk.
   * @param chunkCallback - Callback function to handle the audio chunks.
   * @returns {Promise<void>}
   */
  async record(chunkCallback: (data: {mono: Float32Array}) => void): Promise<void> {
    try {
      // Start recording if not already started
      if (this.isRecording) {
        throw new Error('Recording already in progress');
      }

      await this.recorder.startRecorder(this.recordPath, {
        AVFormatIDKeyIOS: AVEncodingOption.lpcm, // iOS format option
      });

      this.isRecording = true;

      // console.log('Recording started...');

      // Set up a timer to read chunks periodically
      this.chunkInterval = setInterval(async () => {
        try {
          // Read the current recorded file as Base64
          const audioData: string = await FileSystem.readAsStringAsync(this.recordPath, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Convert to Float32Array
          const rawArray: Float32Array = this.base64ToFloat32Array(audioData);

          // Send mono audio data via the callback
          chunkCallback({mono: rawArray});

          // console.log('Chunk processed.');
        } catch (error) {
          console.error('Error processing chunk:', error);
        }
      }, 200); // Processing every 500ms - adjust this as necessary
    } catch (error) {
      console.error('Error starting recording with chunk processing:', error);
    }
  }

  /**
   * Decodes audio data from multiple formats to a Blob, url, Float32Array and AudioBuffer
   * @param {Blob|Float32Array|Int16Array|ArrayBuffer|number[]} audioData
   * @param {number} sampleRate
   * @param {number} fromSampleRate
   * @returns {Promise<DecodedAudioType>}
   */
  static async decode(audioData: Int16Array, sampleRate = 44100, fromSampleRate = -1) {
    const channels: Int16Array[] = [audioData];
    const bitsPerSample = 16;
    const wavBase64String = WavPacker.createWavBase64(audioData, sampleRate, channels, bitsPerSample);

    return wavBase64String;
  }

  /**
   * Helper function to create a WAV header.
   * @param pcmDataLength - Length of the PCM data in bytes.
   * @param sampleRate - Sample rate of the audio.
   * @param numChannels - Number of audio channels.
   * @param bitsPerSample - Number of bits per sample (e.g., 16).
   * @returns {Buffer} - A buffer containing the WAV header.
   */
  static createWavHeader(pcmDataLength: number, sampleRate: number, numChannels: number, bitsPerSample: number): Buffer {
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    const header = Buffer.alloc(44);

    // RIFF chunk descriptor
    header.write('RIFF', 0); // ChunkID
    header.writeUInt32LE(36 + pcmDataLength, 4); // ChunkSize
    header.write('WAVE', 8); // Format

    // "fmt " sub-chunk
    header.write('fmt ', 12); // Subchunk1ID
    header.writeUInt32LE(16, 16); // Subchunk1Size (PCM = 16)
    header.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    header.writeUInt16LE(numChannels, 22); // NumChannels
    header.writeUInt32LE(sampleRate, 24); // SampleRate
    header.writeUInt32LE(byteRate, 28); // ByteRate
    header.writeUInt16LE(blockAlign, 32); // BlockAlign
    header.writeUInt16LE(bitsPerSample, 34); // BitsPerSample

    // "data" sub-chunk
    header.write('data', 36); // Subchunk2ID
    header.writeUInt32LE(pcmDataLength, 40); // Subchunk2Size

    return header;
  }
}

export default WavRecorder;
