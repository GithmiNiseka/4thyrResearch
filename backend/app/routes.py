from flask import request
from app import app, socketio
from app.speech_to_text import transcribe_streaming
import base64

@app.route('/')
def home():
    return "Welcome to the Speech-to-Text API"

@app.route('/favicon.ico')
def favicon():
    return '', 204  # Handle favicon request

@socketio.on('audio_chunk')
def handle_audio_chunk(data):
    try:
        # Extract and decode the Base64 audio data
        audio_data_base64 = data.get('audio', None)
        if not audio_data_base64:
            socketio.emit('error', {'message': 'No audio data received'})
            return

        # Decode Base64 to raw audio bytes
        audio_data = base64.b64decode(audio_data_base64)

        # Transcribe the decoded audio
        transcript = transcribe_streaming(audio_data)

        # Emit the transcription back to the frontend
        socketio.emit('transcription', {'text': transcript})
        print(f"Transcribed text: {transcript}")

    except Exception as e:
        print(f"Error processing audio: {e}")
        socketio.emit('error', {'message': 'Error processing audio'})
