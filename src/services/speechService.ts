import { Audio } from 'expo-av';
import axios from 'axios';
import { GCP_SPEECH_API_KEY } from '../config/api';

interface SpeechConfig {
  encoding: string;
  sampleRateHertz: number;
  languageCode: string;
  enableAutomaticPunctuation?: boolean;
  model?: string;
}

let recording: Audio.Recording | null = null;

export const startRecording = async (): Promise<boolean> => {
  try {
    // Clean up any existing recording
    if (recording) {
      await stopRecording();
    }

    // Request permissions
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Microphone permission not granted');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    // Configure and start recording
    recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
        android: {
            extension: '.wav',
            outputFormat: Audio.AndroidOutputFormat.DEFAULT,
            audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
        },
        ios: {
            extension: '.wav',
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
        },
        web: {
            mimeType: undefined,
            bitsPerSecond: undefined
        }
    });
    
    await recording.startAsync();
    return true;
  } catch (error) {
    console.error('Failed to start recording:', error);
    if (recording) {
      await recording.stopAndUnloadAsync().catch(() => {});
      recording = null;
    }
    return false;
  }
};

export const stopRecording = async (): Promise<string> => {
  if (!recording) {
    throw new Error('No active recording to stop');
  }

  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recording = null;
    
    if (!uri) {
      throw new Error('No audio file was recorded');
    }

    return await recognizeSpeech(uri);
  } catch (error) {
    recording = null;
    console.error('Failed to stop recording:', error);
    throw error;
  }
};

const recognizeSpeech = async (audioUri: string): Promise<string> => {
  try {
    const audioContent = await convertAudioToBase64(audioUri);
    
    const config: SpeechConfig = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'si-LK',
      enableAutomaticPunctuation: true,
      model: 'default'
    };

    const response = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GCP_SPEECH_API_KEY}`,
      {
        config: config,
        audio: {
          content: audioContent,
        },
      },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      }
    );

    if (!response.data?.results) {
      throw new Error('No recognition results returned');
    }

    const transcripts = response.data.results
      .flatMap((result: any) => 
        result.alternatives?.map((alt: any) => alt.transcript?.trim()) || []
      )
      .filter((t: string) => t && t.length > 0);

    return transcripts.join(' ') || '';
  } catch (error) {
    console.error('Speech recognition error:', error);
    if (axios.isAxiosError(error)) {
      console.error('API response:', error.response?.data);
      throw new Error(`Speech API error: ${error.response?.status} - ${error.message}`);
    }
    throw new Error('Failed to recognize speech');
  }
};

const convertAudioToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64Data = reader.result.split(',')[1];
          if (!base64Data) {
            reject(new Error('Invalid base64 audio data'));
          }
          resolve(base64Data);
        } else {
          reject(new Error('Unexpected audio file format'));
        }
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Audio conversion error:', error);
    throw new Error('Failed to process audio file');
  }
};

export const cleanupRecordings = async () => {
  if (recording) {
    try {
      await recording.stopAndUnloadAsync();
    } catch (error) {
      console.error('Cleanup error:', error);
    } finally {
      recording = null;
    }
  }
};