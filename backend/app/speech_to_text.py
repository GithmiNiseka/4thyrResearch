from google.cloud import speech
import io

client = speech.SpeechClient()

def transcribe_audio(audio_data):
    try:
        audio = speech.RecognitionAudio(content=audio_data)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code="si-LK"  # Sinhala language code
        )

        response = client.recognize(config=config, audio=audio)
        results = [result.alternatives[0].transcript for result in response.results]
        
        if results:
            return " ".join(results)
        else:
            return "No speech detected"
    except Exception as e:
        print(f"Error during transcription: {e}")
        return "Error during transcription"