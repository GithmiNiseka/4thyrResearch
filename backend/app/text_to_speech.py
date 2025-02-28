from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import os
import unicodedata
from google.cloud import texttospeech

# Set the Google Cloud credentials.
# Alternatively, set the environment variable GOOGLE_APPLICATION_CREDENTIALS before running the app.
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "deaf-app-449508-4fb87c855e35.json"

app = Flask(__name__)
CORS(app)  # Allow CORS for all domains on all routes

# -----------------------------
# Sinhala Transliteration Setup
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
# Flask Endpoint for TTS
# -----------------------------

@app.route('/speak', methods=['POST'])
def speak():
    """
    Expects a JSON payload with a "text" field.
    Transliterates the text and returns the synthesized speech (MP3).
    """
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Text is required.'}), 400

    text = data['text']
    # Convert Sinhala text to Malay phonetics
    phonetic_text = transliterate_sinhala(text)
    print("Converted Phonetic Text:", phonetic_text)

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
        print("TTS Error:", e)
        return jsonify({'error': 'Failed to generate speech.'}), 500

# -----------------------------
# Run the Flask App
# -----------------------------

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)