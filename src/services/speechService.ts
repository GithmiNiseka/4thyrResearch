// services/speechservice.ts
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { Audio, AVPlaybackStatus } from "expo-av";
import { encode } from "base64-arraybuffer";

// Use the same IP as your transcription endpoint
const SERVER_URL = "http://192.168.181.17:5000/speak";

export const speakText = async (text: string, currentSound: Audio.Sound | null): Promise<Audio.Sound | null> => {
  if (!text.trim()) return currentSound;

  try {
    // First stop any existing sound
    await stopSpeech(currentSound);

    const response = await axios.post(
      SERVER_URL, 
      { text }, 
      { 
        responseType: "arraybuffer",
        timeout: 15000 // Add timeout to prevent hanging
      }
    );

    if (response.status !== 200) {
      throw new Error(`Server returned ${response.status}`);
    }

    if (!response.data || response.data.byteLength === 0) {
      throw new Error("Empty audio response from server");
    }

    // Convert ArrayBuffer to Base64
    const base64Audio = encode(response.data);
    const path = FileSystem.cacheDirectory + "speech.mp3";

    await FileSystem.writeAsStringAsync(path, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: path },
      { shouldPlay: true }
    );

    newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      if (status.isLoaded && status.didJustFinish) {
        newSound.unloadAsync().catch(() => {}); // Silent catch for cleanup
      }
    });

    return newSound;
  } catch (error) {
    console.error("Speech generation error:", error);
    throw error; // Re-throw the error to be caught by the caller
  }
};

export const stopSpeech = async (sound: Audio.Sound | null): Promise<null> => {
  if (!sound) return null;
  
  try {
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  } catch (error) {
    console.error("Error stopping sound:", error);
  }
  return null;
};