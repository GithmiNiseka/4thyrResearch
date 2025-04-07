from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import speech_v1p1beta1 as speech
import os
from pydub import AudioSegment
import io
import tempfile
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    logger.info("Received transcription request")
    
    if 'audio' not in request.files:
        logger.error("No audio file in request")
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    
    try:
        # 1. First debug point - check if file is received
        logger.debug(f"Received file: {audio_file.filename}, size: {len(audio_file.read())} bytes")
        audio_file.seek(0)  # Reset file pointer after reading
        
        # 2. Try converting to FLAC
        try:
            audio = AudioSegment.from_file(io.BytesIO(audio_file.read()))
            audio_file.seek(0)
            logger.debug("Audio conversion successful")
        except Exception as e:
            logger.error(f"Audio conversion failed: {str(e)}")
            return jsonify({"error": "Audio conversion failed", "details": str(e)}), 400
        
        # 3. Try Google Cloud Speech client initialization
        try:
            client = speech.SpeechClient()
            logger.debug("Google Speech client initialized")
        except Exception as e:
            logger.error(f"Google client init failed: {str(e)}")
            return jsonify({"error": "Google service unavailable", "details": str(e)}), 500
        
        # 4. Try actual transcription
        try:
            audio = AudioSegment.from_file(io.BytesIO(audio_file.read()))
            audio = audio.set_frame_rate(16000).set_channels(1)
            flac_buffer = io.BytesIO()
            audio.export(flac_buffer, format="flac")
            flac_content = flac_buffer.getvalue()
            
            response = client.recognize(
                config=speech.RecognitionConfig(
                    encoding=speech.RecognitionConfig.AudioEncoding.FLAC,
                    sample_rate_hertz=16000,
                    language_code="si-LK",
                ),
                audio=speech.RecognitionAudio(content=flac_content)
            )
            
            transcript = " ".join(
                result.alternatives[0].transcript
                for result in response.results
                if result.alternatives
            )
            
            logger.info(f"Transcription successful: {transcript[:50]}...")
            return jsonify({"transcript": transcript})
            
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            return jsonify({"error": "Transcription failed", "details": str(e)}), 500
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500

if __name__ == '__main__':
    # Verify credentials
    if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        logger.error("GOOGLE_APPLICATION_CREDENTIALS not set")
    
    app.run(host='0.0.0.0', port=5000, debug=True)