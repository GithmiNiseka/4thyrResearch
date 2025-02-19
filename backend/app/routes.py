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

@socketio.on("audio_chunk")
def handle_audio_chunk(data):
    audio_bytes = base64.b64decode(data["audio"])
    transcript = transcribe_audio(audio_bytes)
    socketio.emit("transcription", {"text": transcript})
