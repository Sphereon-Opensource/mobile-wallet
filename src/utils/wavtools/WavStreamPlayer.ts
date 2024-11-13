import Sound from 'react-native-sound';
import * as FileSystem from 'expo-file-system';
import {Buffer} from 'buffer';
import WavRecorder from './WavRecorder';
import WavPacker from './WavPacker';

async function checkIfFileExists(filePath: string): Promise<boolean> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    return fileInfo.exists; // This will be true if the file exists
  } catch (error) {
    console.error('Error checking if file exists:', error);
    return false;
  }
}

// Function to append data to a file
async function appendToFile(filePath: string, data: string, encoding: FileSystem.EncodingType = FileSystem.EncodingType.Base64) {
  try {
    // Check if the file exists
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    let existingContent = '';

    if (fileInfo.exists) {
      // Read the existing content of the file
      existingContent = await FileSystem.readAsStringAsync(filePath);
    }

    // Concatenate the new data with the existing content
    const newContent = existingContent + data;

    // Write the combined content back to the file
    await FileSystem.writeAsStringAsync(filePath, newContent, {
      encoding,
    });

    console.log('Data appended successfully.');
  } catch (error) {
    console.error('Error appending data to file:', error);
  }
}

class WavStreamPlayer {
  currentSound: Sound | null;
  trackId: string | null;
  pcmBuffer: Buffer;

  constructor() {
    Sound.setCategory('Playback', true); // Setting playback category
    this.currentSound = null;
    this.trackId = null;
    this.pcmBuffer = Buffer.alloc(0); // Initialize an empty buffer to store PCM data
  }

  loadAndPlay(filePath: string, id: string) {
    try {
      // Make sure the file exists first
      checkIfFileExists(filePath).then(exists => {
        if (!exists) {
          throw new Error('File does not exist!');
        }

        // Load the sound file
        this.currentSound = new Sound(filePath, '', error => {
          if (error) {
            console.error('Failed to load the sound', error);
            return;
          }
          if (!this.currentSound) {
            throw new Error('Sound file not loaded');
          }
          this.trackId = id;
          // Play the sound
          this.currentSound.play(success => {
            if (!success) {
              console.error('Playback failed due to audio decoding errors');
            } else {
              // console.log('Playback started successfully.');
            }
          });
        });
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  async add16BitPCM(pcmData: Int16Array, id: string) {
    const base64String = await WavRecorder.decode(pcmData, 24000, 24000);
    await appendToFile(`${FileSystem.documentDirectory}${id}.wav`, base64String);
  }

  async play16BitPCMArray(pcmData: Int16Array) {
    const base64String = await WavRecorder.decode(pcmData, 24000, 24000);
    this.playWavBase64String(base64String);
  }

  async playWavBase64String(wavBase64String: string) {
    try {
      const wavPath = `${FileSystem.documentDirectory}temp_audio.wav`;

      await FileSystem.writeAsStringAsync(wavPath, wavBase64String, {
        encoding: FileSystem.EncodingType.Base64,
      });
      this.loadAndPlay(wavPath, 'temp');
    } catch (error) {
      console.error('Error playing PCM array:', error);
    }
  }

  stopPlaying() {
    if (this.currentSound) {
      this.currentSound.stop(() => {
        // console.log('Playback stopped.');
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
