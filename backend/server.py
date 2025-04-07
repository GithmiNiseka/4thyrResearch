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

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/transcribe": {"origins": "*"},
    r"/speak": {"origins": "*"}
})

# -----------------------------
# Sinhala Transliteration Setup (for TTS)
# -----------------------------

# Mappings for independent vowels
independentVowels = {
    "අ": "a", "ආ": "aa", "ඇ": "ae", "ඈ": "aae",
    "ඉ": "i", "ඊ": "ii", "උ": "u", "ඌ": "uu",
    "ඍ": "ri", "ඎ": "rii", "එ": "e", "ඒ": "ee",
    "ඓ": "ai", "ඔ": "o", "ඕ": "oo", "ඖ": "au"
}

# Mappings for consonants without inherent vowels
consonants = {
    "ක": "k", "ග": "g", "ච": "ch", "ජ": "j",
    "ට": "t", "ඩ": "d", "ණ": "n", "ත": "th",
    "ද": "d", "න": "n", "ප": "p", "බ": "b",
    "ම": "m", "ය": "y", "ර": "r", "ල": "l",
    "ව": "v", "ස": "s", "හ": "h", "ළ": "l",
    "ෆ": "f"
}

# Mappings for vowel diacritics that modify a consonant
vowelDiacritics = {
    "ා": "aa", "ැ": "ae", "ෑ": "aae",
    "ි": "i", "ී": "ii", "ු": "u",
    "ූ": "uu", "ෙ": "e", "ේ": "ee",
    "ෛ": "ai", "ො": "o", "ෝ": "oo",
    "ෞ": "au"
}

# Diacritics that require an extra "a" before the mapped vowel
diacriticsThatRequireA = {"ෙ", "ේ"}

# The hal kirīma character, which suppresses the inherent vowel
halKirima = "්"

def transliterate_sinhala(text):
    """
    Convert Sinhala text to a Malay-phonetic transliteration.
    """
    # Normalize text (similar to JS .normalize('NFC'))
    text = unicodedata.normalize('NFC', text)
    result = ""
    i = 0

    while i < len(text):
        ch = text[i]

        # If the character is an independent vowel, append its mapping.
        if ch in independentVowels:
            result += independentVowels[ch]
            i += 1
            continue

        # If the character is a consonant:
        if ch in consonants:
            # Check if a hal kirīma follows to indicate a consonant cluster.
            if i + 1 < len(text) and text[i + 1] == halKirima:
                cluster = []
                # Collect all consonants in the cluster.
                while i < len(text) and text[i] in consonants and (i + 1 < len(text) and text[i + 1] == halKirima):
                    cluster.append(consonants[text[i]])
                    i += 2  # Skip the consonant and the hal kirīma.
                # Process the base consonant of the cluster.
                if i < len(text) and text[i] in consonants:
                    base = consonants[text[i]]
                    i += 1
                    # If a vowel diacritic follows, process it.
                    if i < len(text) and text[i] in vowelDiacritics:
                        d = text[i]
                        base += ("a" + vowelDiacritics[d]) if d in diacriticsThatRequireA else vowelDiacritics[d]
                        i += 1
                    else:
                        base += "a"  # Append inherent vowel.
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
                    base += "a"  # Append inherent vowel.
                result += base
            continue

        # If the character is a vowel diacritic, append its mapping.
        if ch in vowelDiacritics:
            result += vowelDiacritics[ch]
            i += 1
            continue

        # Skip the hal kirīma if it appears alone.
        if ch == halKirima:
            i += 1
            continue

        # For any other character, just append it as-is.
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

# -----------------------------
# Text-to-Speech Endpoint
# -----------------------------

@app.route('/speak', methods=['POST'])
def speak():
    """
    Expects a JSON payload with a "text" field.
    Transliterates the text and returns the synthesized speech (MP3).
    """
    logger.info("Received TTS request")

    data = request.get_json()
    if not data or 'text' not in data:
        logger.error("No text in TTS request")
        return jsonify({'error': 'Text is required.'}), 400

    text = data['text']
    # Convert Sinhala text to Malay phonetics
    phonetic_text = transliterate_sinhala(text)
    logger.info(f"Converted Phonetic Text: {phonetic_text}")

    try:
        # Initialize the Google Cloud TTS client
        client = texttospeech.TextToSpeechClient()

        synthesis_input = texttospeech.SynthesisInput(text=phonetic_text)
        voice = texttospeech.VoiceSelectionParams(
            language_code='ms-MY',
            name='ms-MY-Standard-A'
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=0.9
        )

        # Perform the text-to-speech request
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        # Return the MP3 audio with the appropriate header
        return Response(response.audio_content, mimetype='audio/mpeg')
    except Exception as e:
        logger.error(f"TTS Error: {str(e)}")
        return jsonify({'error': 'Failed to generate speech.'}), 500

# -----------------------------
# Main Application
# -----------------------------

if __name__ == '__main__':
    # Verify credentials
    if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        logger.error("GOOGLE_APPLICATION_CREDENTIALS not set")
    
    app.run(host='0.0.0.0', port=5000, debug=True)