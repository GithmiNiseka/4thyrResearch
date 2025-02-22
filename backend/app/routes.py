from flask import request
from app import app, socketio
from app.speech_to_text import transcribe_audio
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
        audio_data = data['audio']
        
        # Your logic for handling audio (decoding, saving, etc.)
        print(f"Received audio data: {audio_data[:30]}...")  # For debugging
        

    except Exception as e:
        print(f"Error processing audio: {e}")
        socketio.emit('error', {'message': 'Error processing audio'})