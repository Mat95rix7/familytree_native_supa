import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
// import PersonForm from '../../../components/PersonForm';
import { PersonForm } from '../../../components/PersonForm';
import { apiFetch } from '../../../services/FetchAPI';
import { Personne } from '../../../types';

export default function EditPersonne(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [personne, setPersonne] = useState<Personne | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonne = async () => {
      try {
        const response = await apiFetch(`/personnes/${id}/`);
        const data = await response.json();
        setPersonne(data);
      } catch (error) {
        console.error('Erreur lors du chargement de la personne :', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPersonne();
    }
  }, [id]);

  const handleSuccess = () => {
    router.back();
  };

  if (loading || !personne) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PersonForm
        initialData={personne}
        mode="edit"
        onSuccess={handleSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
});
