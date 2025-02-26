from google.cloud import speech
import io

client = speech.SpeechClient()

def transcribe_streaming(audio_stream):
    """Handles real-time Sinhala speech recognition."""
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="si-LK",
    )
    streaming_config = speech.StreamingRecognitionConfig(config=config, interim_results=True)

    requests = (speech.StreamingRecognizeRequest(audio_content=chunk) for chunk in audio_stream)

    response = client.streaming_recognize(streaming_config, requests)
    
    for result in response:
        for alternative in result.results:
            print("Real-time transcript:", alternative.alternatives[0].transcript)
