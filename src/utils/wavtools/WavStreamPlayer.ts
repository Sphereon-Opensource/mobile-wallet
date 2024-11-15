import Sound from 'react-native-sound';
import * as FileSystem from 'expo-file-system';
import {Buffer} from 'buffer';
import WavRecorder from './WavRecorder';

async function checkIfFileExists(filePath: string): Promise<boolean> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    return fileInfo.exists; // This will be true if the file exists
  } catch (error) {
    console.error('Error checking if file exists:', error);
    return false;
  }
}

class WavStreamPlayer {
  currentSound: Sound | null;
  trackId: string | null;
  pcmBuffer: Buffer;
  queue: {sound: Sound; filePath: string}[];
  playing: boolean;

  constructor() {
    Sound.setCategory('Playback', true); // Setting playback category
    this.currentSound = null;
    this.trackId = null;
    this.pcmBuffer = Buffer.alloc(0); // Initialize an empty buffer to store PCM data
    this.queue = [];
  }

  async playQueuedFile() {
    console.log('Playing queued file', this.queue.length);
    if (this.queue.length > 0) {
      const queueItem = this.queue.shift();
      if (queueItem) {
        try {
          await this.play(queueItem.sound, queueItem.filePath, 'temp');
        } finally {
          this.playQueuedFile();
        }
      }
    }
  }

  play(sound: Sound, filePath: string, id: string) {
    return new Promise<void>((resolve, reject) => {
      try {
        this.currentSound = sound;
        this.trackId = id;
        sound.play(success => {
          this.currentSound = null;
          // FileSystem.deleteAsync(filePath).catch(console.error);
          if (!success) {
            console.error('Playback failed due to audio decoding errors');
            reject(new Error('Playback failed due to audio decoding errors'));
          } else {
            resolve();
          }
        });
      } catch (error) {
        console.error('Error playing sound:', error);
        reject(error);
      }
    });
  }

  async add16BitPCM(pcmData: Int16Array, id: string) {
    const base64String = await WavRecorder.decode(pcmData, 24000, 24000);
    const filenamePrefix = `${FileSystem.documentDirectory}${id}`;
    const timestamp = new Date().getTime();
    const filePath = `${filenamePrefix}_${timestamp}.wav`;
    await FileSystem.writeAsStringAsync(filePath, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const sound = new Sound(filePath, '', error => {
      if (error) {
        console.error('Failed to load the sound', error);
        return;
      }
      this.queue.push({sound, filePath});
      setTimeout(() => {
        if (!this.currentSound) {
          this.playQueuedFile();
        }
      }, 300); // Delay playback to allow for more audio to be added
    });
  }

  stopPlaying() {
    if (this.currentSound) {
      this.currentSound.stop(() => {
        // console.log('Playback stopped.');
        this.currentSound = null;
      });
    } else {
      // console.log('No sound is currently playing.');
    }
  }

  async interrupt() {
    return new Promise<{trackId: string | null; offset: number} | undefined>((resolve, reject) => {
      if (this.currentSound) {
        this.currentSound.pause();
        this.currentSound.getCurrentTime(seconds => {
          resolve({
            trackId: this.trackId,
            offset: seconds,
          });
        });
      } else {
        // console.log('No sound is currently playing to interrupt.');
      }
    });
  }
}

export default WavStreamPlayer;
