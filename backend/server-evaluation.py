from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from google.cloud import speech_v1p1beta1 as speech
from google.cloud import texttospeech
from jiwer import wer, cer, compute_measures
import os
from pydub import AudioSegment
import io
import logging
import unicodedata

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# -----------------------------
# Text Validation Functions
# -----------------------------

def is_sinhala(char):
    sinhala_ranges = [(0x0D80, 0x0DFF), (0x111E0, 0x111FF)]
    char_code = ord(char)
    return any(start <= char_code <= end for start, end in sinhala_ranges)

def is_valid_input(text):
    allowed_punctuation = set(" .,!?;:-'\"()[]{}«»‹›‘’“”")
    for char in text:
        if char in allowed_punctuation or char.isspace() or is_sinhala(char):
            continue
        return False
    return True

def get_invalid_chars(text):
    invalid_chars = set()
    for char in text:
        if not (is_sinhala(char) or char.isdigit() or char in " .,!?;:-'\"()[]{}«»‹›‘’“”"):
            invalid_chars.add(char)
    return sorted(invalid_chars)

# -----------------------------
# Digit to Sinhala Conversion
# -----------------------------

digit_to_sinhala = {
    '0': 'ශුන්ය', '1': 'එක', '2': 'දෙක', '3': 'තුන',
    '4': 'හතර', '5': 'පහ', '6': 'හය', '7': 'හත',
    '8': 'අට', '9': 'නවය'
}

def convert_digits_to_sinhala(text):
    return ''.join([digit_to_sinhala.get(c, c) for c in text])

# -----------------------------
# Sinhala Transliteration
# -----------------------------

independentVowels = {
    "අ": "a", "ආ": "ā", "ඇ": "æ", "ඈ": "ǣ", "ඉ": "i", "ඊ": "ī", "උ": "ū", "ඌ": "uu",
    "ඍ": "ṛ", "ඎ": "ṝ", "එ": "e", "ඒ": "ē", "ඓ": "ai", "ඔ": "o", "ඕ": "ō", "ඖ": "au"
}
consonants = {
    "ක": "k", "ග": "g", "ච": "ch", "ජ": "j", "ට": "t", "ඩ": "d", "ණ": "n", "ත": "th",
    "ද": "d", "න": "n", "ප": "p", "බ": "b", "ම": "m", "ය": "y", "ර": "r", "ල": "l",
    "ව": "v", "ස": "s", "හ": "h", "ළ": "l", "ෆ": "f", "ඳ": "n̆d", "ඹ": "m̆b"
}
vowelDiacritics = {
    "ා": "ā", "ැ": "æ", "ෑ": "ǣ", "ි": "i", "ී": "ī", "ු": "u", "ූ": "ū",
    "ෙ": "e", "ේ": "ē", "ෛ": "ai", "ො": "o", "ෝ": "ō", "ෞ": "au"
}
halKirima = "්"
diacriticsThatRequireA = {"ෙ", "ේ"}

def transliterate_sinhala(text):
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
                while i + 1 < len(text) and text[i + 1] == halKirima:
                    cluster.append(consonants[text[i]])
                    i += 2
                if i < len(text) and text[i] in consonants:
                    base = consonants[text[i]]
                    i += 1
                    if i < len(text) and text[i] in vowelDiacritics:
                        d = text[i]
                        base += "a" + vowelDiacritics[d] if d in diacriticsThatRequireA else vowelDiacritics[d]
                        i += 1
                    else:
                        base += "a"
                    result += ''.join(cluster) + base
                else:
                    result += ''.join(cluster)
            else:
                base = consonants[ch]
                i += 1
                if i < len(text) and text[i] in vowelDiacritics:
                    d = text[i]
                    base += "a" + vowelDiacritics[d] if d in diacriticsThatRequireA else vowelDiacritics[d]
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
# Evaluation Metrics
# -----------------------------

def calculate_metrics(reference, hypothesis):
    measures = compute_measures(reference, hypothesis)
    return {
        "WER": round(measures['wer'] * 100, 2),
        "CER": round(cer(reference, hypothesis) * 100, 2),
        "MER": round(measures['mer'] * 100, 2),
        "SER": round(measures['wil'] * 100, 2),
        "Accuracy": round((1 - measures['wer']) * 100, 2)
    }

# -----------------------------
# /transcribe Endpoint
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
        audio = AudioSegment.from_file(io.BytesIO(audio_file.read()))
        audio = audio.set_frame_rate(16000).set_channels(1)
        flac_buffer = io.BytesIO()
        audio.export(flac_buffer, format="flac")
        flac_content = flac_buffer.getvalue()

        client = speech.SpeechClient()
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

        # Replace with actual reference per use case
        reference = "කොච්චර කාලයක ඉඳන්ද "
        metrics = calculate_metrics(reference, transcript)

        return jsonify({
            "transcript": transcript,
            "reference": reference,
            "metrics": metrics,
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
# /speak Endpoint
# -----------------------------

@app.route('/speak', methods=['POST'])
def speak():
    logger.info("Received TTS request")

    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({
            'error': 'Text is required',
            'user_message': 'කරුණාකර පණිවිඩයක් ඇතුලත් කරන්න'
        }), 400

    text = data['text'].strip()
    if not text:
        return jsonify({
            'error': 'Empty text',
            'user_message': 'කරුණාකර හිස් පණිවිඩයක් යවන්න එපා'
        }), 400

    if not is_valid_input(text):
        invalid_chars = get_invalid_chars(text)
        return jsonify({
            'error': 'Invalid characters detected',
            'user_message': 'කරුණාකර වලංගු අකුරු පමණක් භාවිතා කරන්න',
            'invalid_characters': invalid_chars
        }), 400

    try:
        text_with_sinhala_digits = convert_digits_to_sinhala(text)
        phonetic_text = transliterate_sinhala(text_with_sinhala_digits)

        client = texttospeech.TextToSpeechClient()
        voice = texttospeech.VoiceSelectionParams(
            language_code='ms-MY',
            name='ms-MY-Standard-A'
        )
        synthesis_input = texttospeech.SynthesisInput(text=phonetic_text)
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=0.9
        )
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
