from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from google.cloud import speech_v1p1beta1 as speech
from google.cloud import texttospeech
import os
from pydub import AudioSegment
import io
import tempfile
import logging
import unicodedata
import re

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/transcribe": {"origins": "*"},
    r"/speak": {"origins": "*"}
})

# -----------------------------
# Text Validation Functions
# -----------------------------

def is_sinhala(char):
    """Check if a single character is Sinhala"""
    sinhala_ranges = [
        (0x0D80, 0x0DFF),  # Basic Sinhala
        (0x111E0, 0x111FF),  # Sinhala Archaic Numbers
    ]
    char_code = ord(char)
    return any(start <= char_code <= end for start, end in sinhala_ranges)

def is_valid_input(text):
    """Check if text contains only allowed characters (Sinhala letters only)"""
    allowed_punctuation = set(" .,!?;:-'\"()[]{}«»‹›‘'“”")
    
    for char in text:
        # Skip allowed punctuation and whitespace
        if char in allowed_punctuation or char.isspace():
            continue
            
        # Check if character is Sinhala (no digits allowed)
        if is_sinhala(char):
            continue
            
        return False
        
    return True

def get_invalid_chars(text):
    """Identify and return invalid characters in text"""
    invalid_chars = set()
    for char in text:
        if not (is_sinhala(char) or 
               char.isdigit() or 
               char in " .,!?;:-'\"()[]{}«»‹›‘’“”"):
            invalid_chars.add(char)
    return sorted(invalid_chars)

# -----------------------------
# Digit to Sinhala Conversion
# -----------------------------

digit_to_sinhala = {
    '0': 'ශුන්ය',
    '1': 'එක',
    '2': 'දෙක',
    '3': 'තුන',
    '4': 'හතර',
    '5': 'පහ',
    '6': 'හය',
    '7': 'හත',
    '8': 'අට',
    '9': 'නවය'
}

def convert_digits_to_sinhala(text):
    """Convert all digits in text to their Sinhala word equivalents"""
    return ''.join([digit_to_sinhala.get(c, c) for c in text])

# -----------------------------
# Sinhala Transliteration Setup
# -----------------------------

independentVowels = {
    "අ": "a", "ආ": "ā", "ඇ": "æ", "ඈ": "ǣ",
    "ඉ": "i", "ඊ": "ī", "උ": "ū", "ඌ": "uu",
    "ඍ": "ṛ", "ඎ": "ṝ", "එ": "e", "ඒ": "ē",
    "ඓ": "ai", "ඔ": "o", "ඕ": "ō", "ඖ": "au"
}

consonants = {
    "ක": "k", "ග": "g", "ච": "ch", "ජ": "j",
    "ට": "t", "ඩ": "d", "ණ": "n", "ත": "th",
    "ද": "d", "න": "n", "ප": "p", "බ": "b",
    "ම": "m", "ය": "y", "ර": "r", "ල": "l",
    "ව": "v", "ස": "s", "හ": "h", "ළ": "l",
    "ෆ": "f", "ඳ": "n̆d", "ඹ": "m̆b"
}

vowelDiacritics = {
    "ා": "ā", "ැ": "æ", "ෑ": "ǣ",
    "ි": "i", "ී": "ī", "ු": "u",
    "ූ": "ū", "ෙ": "e", "ේ": "ē",
    "ෛ": "ai", "ො": "o", "ෝ": "ō",
    "ෞ": "au"
}

diacriticsThatRequireA = {"ෙ", "ේ"}
halKirima = "්"

def transliterate_sinhala(text):
    """Convert Sinhala text to Malay-phonetic transliteration."""
    text = unicodedata.normalize('NFC', text)
    result = ""
    i = 0

    while i < len(text):
        ch = text[i]

        if ch in independentVowels:
            result += independentVowels[ch]
            i += 1
        elif ch in consonants:
            if i + 1 < len(text) and text[i + 1] == halKirima:
                cluster = []
                while i < len(text) and text[i] in consonants and (i + 1 < len(text) and text[i + 1] == halKirima):
                    cluster.append(consonants[text[i]])
                    i += 2
                if i < len(text) and text[i] in consonants:
                    base = consonants[text[i]]
                    i += 1
                    if i < len(text) and text[i] in vowelDiacritics:
                        d = text[i]
                        base += ("a" + vowelDiacritics[d]) if d in diacriticsThatRequireA else vowelDiacritics[d]
                        i += 1
                    else:
                        base += "a"
                    result += "".join(cluster) + base
                else:
                    result += "".join(cluster)
            else:
                base = consonants[ch]
                i += 1
                if i < len(text) and text[i] in vowelDiacritics:
                    d = text[i]
                    base += ("a" + vowelDiacritics[d]) if d in diacriticsThatRequireA else vowelDiacritics[d]
                    i += 1
                else:
                    base += "a"
                result += base
        elif ch in vowelDiacritics:
            result += vowelDiacritics[ch]
            i += 1
        elif ch == halKirima:
            i += 1
        else:
            result += ch
            i += 1

    return result

# -----------------------------
# Speech-to-Text Endpoint
# -----------------------------

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    logger.info("Received transcription request")
    
    if 'audio' not in request.files:
        return jsonify({
            "error": "No audio file provided",
            "user_message": "කරුණාකර ශ්‍රව්‍ය ගොනුවක් ඇතුලත් කරන්න"
        }), 400
    
    audio_file = request.files['audio']
    
    try:
        # Convert audio to FLAC format
        audio = AudioSegment.from_file(io.BytesIO(audio_file.read()))
        audio = audio.set_frame_rate(16000).set_channels(1)
        flac_buffer = io.BytesIO()
        audio.export(flac_buffer, format="flac")
        flac_content = flac_buffer.getvalue()
        
        # Initialize Google Speech client
        client = speech.SpeechClient()
        
        # Perform transcription
        response = client.recognize(
            config=speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.FLAC,
                sample_rate_hertz=16000,
                language_code="si-LK",
            ),
            audio=speech.RecognitionAudio(content=flac_content)
        )
        
        # Extract transcript
        transcript = " ".join(
            result.alternatives[0].transcript
            for result in response.results
            if result.alternatives
        )
        
        logger.info(f"Transcription successful: {transcript[:50]}...")
        return jsonify({
            "transcript": transcript,
            "isTranscription": True
        })
        
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        return jsonify({
            "error": "Transcription failed",
            "user_message": "කථිත පණිවිඩය හඳුනා ගැනීමට අපොහොසත් විය",
            "details": str(e)
        }), 500

# -----------------------------
# Text-to-Speech Endpoint
# -----------------------------

@app.route('/speak', methods=['POST'])
def speak():

    """Convert text to speech with digits converted to Sinhala words"""
    logger.info("Received TTS request")

    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({
            'error': 'Text is required',
            'user_message': 'කරුණාකර පණිවිඩයක් ඇතුලත් කරන්න'
        }), 400

    text = data['text'].strip()
    
    # Validate text is not empty
    if not text:
        return jsonify({
            'error': 'Empty text',
            'user_message': 'කරුණාකර හිස් පණිවිඩයක් යවන්න එපා'
        }), 400
    
    # Validate characters
    if not is_valid_input(text):
        invalid_chars = get_invalid_chars(text)
        return jsonify({
            'error': 'Invalid characters detected',
            'user_message': 'කරුණාකර වලංගු අකුරු පමණක් භාවිතා කරන්න',
            'invalid_characters': invalid_chars,
            'suggestion': f'අවලංගු අකුරු: {", ".join(invalid_chars)}'
        }), 400

    try:
        # Convert digits to Sinhala words
        text_with_sinhala_digits = convert_digits_to_sinhala(text)
        
        # Transliterate the entire text (now with digits converted to Sinhala words)
        phonetic_text = transliterate_sinhala(text_with_sinhala_digits)
        
        # Initialize TTS client
        client = texttospeech.TextToSpeechClient()

        # Configure Malay voice for Sinhala
        voice = texttospeech.VoiceSelectionParams(
            language_code='ms-MY',
            name='ms-MY-Standard-A'
        )

        # Configure audio output
        synthesis_input = texttospeech.SynthesisInput(text=phonetic_text)
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=0.9
        )

        # Generate speech
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        return Response(response.audio_content, mimetype='audio/mpeg')
        
    except Exception as e:
        logger.error(f"TTS Error: {str(e)}")
        return jsonify({
            'error': 'Failed to generate speech',
            'user_message': 'කථිත පණිවිඩය ජනනය කිරීමට අපොහොසත් විය',
            'details': str(e)
        }), 500

# -----------------------------
# Health Check Endpoint
# -----------------------------

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "services": {
            "speech_to_text": "available",
            "text_to_speech": "available"
        }
    })

# -----------------------------
# Main Application
# -----------------------------

if __name__ == '__main__':
    if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        logger.warning("GOOGLE_APPLICATION_CREDENTIALS environment variable not set")
    
    app.run(host='0.0.0.0', port=5000, debug=True)