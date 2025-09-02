import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { PersonForm } from '../../components/PersonForm'
import { apiFetch } from '../../services/FetchAPI';

// Ajout de la fonction utilitaire pour convertir une data URI en Blob
function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export default function NewPersonne() {
  const [personnes, setPersonnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch('/personnes')
      .then(res => res.json())
      .then(data => {
        setPersonnes(data);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (values) => {
    setSaving(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      const v: any = value;
      if (key === 'photo' && v && v.uri) {
        const uri = v.uri;
        let name = 'photo.jpg';
        let type = 'image/jpeg';
        if (typeof uri === 'string' && uri.startsWith('data:')) {
          const match = uri.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
          if (match) {
            type = match[1];
            const ext = type.split('/')[1] || 'jpg';
            name = `photo.${ext}`;
          }
          const blob = dataURItoBlob(uri);
          formData.append('photo', blob, name);
        } else if (typeof uri === 'string') {
          name = uri.split('/').pop() || 'photo.jpg';
          const extMatch = /\.(\w+)$/.exec(name);
          type = extMatch ? `image/${extMatch[1]}` : 'image';
          formData.append('photo', name);
        }
      } else if (key === 'birth_date' && typeof v === 'string' && v.includes('/')) {
        // Conversion DD/MM/YYYY → YYYY-MM-DD
        const parts = v.split('/');
        if (parts.length === 3) {
          value = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        formData.append(key, String(value));
      } else if (["fatherId", "motherId", "conjointId"].includes(key)) {
        // Convertir en nombre ou chaîne vide
        if (v && v !== '') {
          formData.append(key, String(Number(v)));
        } else {
          formData.append(key, '');
        }
      } else if (value) {
        formData.append(key, value);
      }
    });
    const response = await apiFetch('/personnes', {
      method: 'POST',
      // Ne pas définir Content-Type ici !
      body: formData,
    });
    setSaving(false);
    if (response.ok) {
      const personnesData = await apiFetch('/personnes').then(res => res.json()).then(res => res.json());
      setPersonnes(personnesData);
      router.push('/personnes');
    } else {
      Alert.alert('Erreur lors de l\'ajout !');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      <PersonForm
        initialValues={{
          first_name: '',
          last_name: '',
          gender: '',
          birth_date: '',
          birth_place: '',
          fatherId: '',
          motherId: '',
          conjointId: '',
          photo: null,
          notes: '',
          date_deces: ''
        }}
        personnes={personnes}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Ajouter"
        saving={saving}
        onCancel={() => router.back()}
      />
    </View>
  );
}
