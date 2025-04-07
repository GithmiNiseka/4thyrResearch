// components/MedicalImagePopup.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import axios from 'axios';

interface MedicalImagePopupProps {
  term: string;
  onClose: () => void;
}

const MedicalImagePopup: React.FC<MedicalImagePopupProps> = ({ term, onClose }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [englishTerm, setEnglishTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicalImage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Step 1: Translate Sinhala to English
      const translationRes = await axios.post(
        'https://translation.googleapis.com/language/translate/v2',
        {},
        {
          params: {
            q: term,
            target: 'en',
            source: 'si',
            key: 'GOOGLE_API_KEY',
          },
        }
      );
      
      const translatedTerm = translationRes.data.data.translations[0].translatedText;
      setEnglishTerm(translatedTerm);

      // Step 2: Get medical image
      const imageRes = await axios.get(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${translatedTerm}&pithumbsize=300&origin=*`
      );
      
      const pages = imageRes.data.query.pages;
      const pageId = Object.keys(pages)[0];
      const thumbnail = pages[pageId]?.thumbnail?.source;
      
      if (thumbnail) {
        setImageUrl(thumbnail);
      } else {
        setError('No image found for this term');
      }
    } catch (err) {
      console.error('Error fetching medical image:', err);
      setError('Failed to load medical information');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMedicalImage();
  }, [term]);

  return (
    <Modal transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.popup}>
          <Text style={styles.term}>{term}</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#128C7E" />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : imageUrl ? (
            <>
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.image} 
                resizeMode="contain" 
              />
              <Text style={styles.translation}>{englishTerm}</Text>
            </>
          ) : null}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popup: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  term: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  image: {
    width: 250,
    height: 200,
    marginVertical: 10,
    borderRadius: 5,
  },
  translation: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
  },
  error: {
    color: 'red',
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: '#128C7E',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MedicalImagePopup;