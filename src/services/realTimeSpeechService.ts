// import { Audio } from 'expo-av';
// import WebSocket from 'react-native-websocket';
// import { encode as base64Encode } from 'base-64';

// const SAMPLE_RATE = 16000;
// const LANGUAGE_CODE = 'si-LK'; // Sinhala (Sri Lanka)
// const SPEECH_API_URL = `wss://speech.googleapis.com/v1/speech:streamingRecognize?key=YOUR_API_KEY`;

// interface StreamingRecognitionConfig {
//   config: {
//     encoding: 'LINEAR16';
//     sampleRateHertz: number;
//     languageCode: string;
//     enableAutomaticPunctuation: boolean;
//   };
//   interimResults: boolean;
// }

// export class RealTimeSpeechService {
//   private socket: WebSocket | null = null;
//   private recording: Audio.Recording | null = null;
//   private isRecording = false;

//   constructor(
//     private onTranscript: (transcript: string, isFinal: boolean) => void,
//     private onError: (error: string) => void
//   ) {}

//   async startRecording() {
//     try {
//       // Request permissions
//       await Audio.requestPermissionsAsync();
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       // Initialize WebSocket connection
//       this.socket = new WebSocket(SPEECH_API_URL);
//       this.socket.onopen = () => this.setupSocket();
//       this.socket.onerror = (e) => this.onError('WebSocket error');

//       // Start audio recording
//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );
//       this.recording = recording;
//       this.isRecording = true;

//       // Send initial config message
//       const configMessage: StreamingRecognitionConfig = {
//         config: {
//           encoding: 'LINEAR16',
//           sampleRateHertz: SAMPLE_RATE,
//           languageCode: LANGUAGE_CODE,
//           enableAutomaticPunctuation: true,
//         },
//         interimResults: true,
//       };
//       this.socket.send(JSON.stringify(configMessage));

//       // Start sending audio data
//       await this.startAudioStream();
//     } catch (error) {
//       this.onError(error instanceof Error ? error.message : 'Unknown error');
//     }
//   }

//   private setupSocket() {
//     if (!this.socket) return;

//     this.socket.onmessage = (e) => {
//       const data = JSON.parse(e.data);
//       if (data.error) {
//         this.onError(data.error.message);
//         return;
//       }

//       const result = data.results[0];
//       if (result && result.alternatives[0]) {
//         const transcript = result.alternatives[0].transcript;
//         const isFinal = result.isFinal;
//         this.onTranscript(transcript, isFinal);
//       }
//     };
//   }

//   private async startAudioStream() {
//     if (!this.recording) return;

//     // For Expo, we need to periodically read the recording file
//     // This is a simplified approach - production would need more robust streaming
//     const intervalId = setInterval(async () => {
//       if (!this.isRecording || !this.socket) {
//         clearInterval(intervalId);
//         return;
//       }

//       try {
//         const uri = this.recording.getURI();
//         if (!uri) return;

//         const audioData = await FileSystem.readAsStringAsync(uri, {
//           encoding: FileSystem.EncodingType.Base64,
//         });

//         this.socket.send(JSON.stringify({
//           audioContent: audioData,
//         }));
//       } catch (error) {
//         console.error('Streaming error:', error);
//       }
//     }, 300); // Send chunks every 300ms
//   }

//   async stopRecording() {
//     this.isRecording = false;
//     if (this.recording) {
//       await this.recording.stopAndUnloadAsync();
//       this.recording = null;
//     }
//     if (this.socket) {
//       this.socket.close();
//       this.socket = null;
//     }
//   }
// }