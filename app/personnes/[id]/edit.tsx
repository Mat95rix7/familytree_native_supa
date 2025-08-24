import { useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import PersonForm from '../../../components/PersonForm';
import { apiFetch } from '../../../services/FetchAPI';

// Ajout de la fonction utilitaire en haut du fichier
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

export default function EditPersonne() {
  const route = useRoute();
  // @ts-ignore
  const { id } = route.params || {};
  const [personne, setPersonne] = useState(null);
  const [personnes, setPersonnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch(`/personnes/${id}/`).then(res => res.json()),
      apiFetch('/personnes').then(res => res.json())
    ]).then(([personneData, personnesData]) => {
      setPersonne(personneData);
      setPersonnes(personnesData);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (values: any) => {
    setSaving(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      const v: any = value;
      if (key === 'photo' && v && v.uri) {
        const uri = v.uri;
        let name = 'photo.jpg';
        let type = 'image/jpeg';

        if (typeof uri === 'string' && uri.startsWith('data:')) {
          // Extraire le type MIME
          const match = uri.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
          if (match) {
            type = match[1];
            const ext = type.split('/')[1] || 'jpg';
            name = `photo.${ext}`;
          }
          // Convertir la data URI en Blob
          const blob = dataURItoBlob(uri);
          formData.append('photo', blob, name);
        } else if (typeof uri === 'string') {
          // Cas d'un vrai chemin de fichier (rare en Expo)
          name = uri.split('/').pop() || 'photo.jpg';
          const extMatch = /\.(\w+)$/.exec(name);
          type = extMatch ? `image/${extMatch[1]}` : 'image';
          formData.append('photo', { uri, name, type } as any);
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
      } else if (typeof v === 'string' || typeof v === 'number') {
        formData.append(key, String(v));
      }
    });

    try {
      const response = await apiFetch(`/personnes/${id}/`, {
        method: 'PUT',
        // Ne pas définir 'Content-Type' ici !
        body: formData,
      });
      setSaving(false);
      if (response.ok) {
        const personnesData = await apiFetch('/personnes').then(res => res.json());
        setPersonnes(personnesData);
        router.back();

      } else {
        Alert.alert('Erreur lors de la modification !');
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      setSaving(false);
      Alert.alert('Erreur lors de la modification !');
    }
  };

  if (loading || !personne) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}><ActivityIndicator size="large" color="#06b6d4" /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      <PersonForm
        initialValues={personne}
        personnes={personnes}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Enregistrer"
        saving={saving}
        onCancel={() => router.back()}
      />
    </View>
  );
}
