import { RouteProp, useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch, getPhotoUrl } from '../../../services/FetchAPI';

type Personne = {
  id: number;
  first_name: string;
  last_name: string;
  gender?: string;
  age?: number;
  birth_date?: string;
  birth_place?: string;
  photo?: string;
  notes?: string;
  father?: Partial<Personne>;
  mother?: Partial<Personne>;
  conjoint?: Partial<Personne>;
};

type RouteParams = {
  params: {
    id: string;
  };
};

function formatDateFR(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}


function getNomPrenom(obj?: Partial<Personne>): string {
  return obj ? `${obj.first_name || ''} ${obj.last_name || ''}`.trim() : 'Non renseigné';
}

export default function PersonneDetail() {
  const route = useRoute<RouteProp<RouteParams>>();
  const { id } = route.params || {};

  const [personne, setPersonne] = useState<Personne | null>(null);
  const [loading, setLoading] = useState(true);

  const { role } = useAuth();

  useEffect(() => {
    if (!id) return;
    apiFetch(`/personnes/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setPersonne(data);
        setLoading(false);
      });
  }, [id]);

  const getIdFamille = () => {
    if (!personne?.conjointId) return null;
    if (personne?.gender === 'Homme') return personne.id;
    if (personne?.gender === 'Femme' && personne?.conjointId) return personne?.conjointId;
  return null;
};

  const handleDelete = async () => {
    const confirmDelete = async () => {
      const response = await apiFetch(`/personnes/${id}/`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/personnes');
      } else {
        Alert.alert('Erreur lors de la suppression !');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Supprimer cette personne ?');
      if (confirmed) await confirmDelete();
    } else {
      Alert.alert('Supprimer cette personne ?', '', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: confirmDelete },
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!personne) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Personne non trouvée</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* PHOTO EN HAUT */}
      <View style={styles.photoContainer}>
        <Image
          source={{ uri: getPhotoUrl(personne.photo) }}
          style={styles.photo}
        />
        {personne.age ? (
          <View style={styles.ageBadge}>
            <Text style={styles.ageText}>{personne.age} ans</Text>
          </View>
        ) : null}
      </View>

      {/* INFOS */}
      <View style={styles.card}>
        <Text style={styles.name}>
          {personne.last_name.toUpperCase()} {personne.first_name}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Genre :</Text>
          <Text style={styles.value}>{personne.gender || 'Non renseigné'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Date de naissance :</Text>
          <Text style={styles.value}>{formatDateFR(personne.birth_date)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Lieu de naissance :</Text>
          <Text style={styles.value}>{personne.birth_place || 'Non renseigné'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Père :</Text>
          <Text style={styles.value}>{getNomPrenom(personne.father)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Mère :</Text>
          <Text style={styles.value}>{getNomPrenom(personne.mother)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Conjoint :</Text>
          <Text style={styles.value}>{getNomPrenom(personne.conjoint)}</Text>
        </View>

        {personne.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notes}>{personne.notes}</Text>
          </View>
        ) : null}

        {/* BOUTONS */}
        { role === 'admin' && (
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.editBtn]}
            onPress={() =>
              {
                  const id = personne.id.toString();
                  router.push(`/personnes/${id}/edit`);
                }
            }
          >
            <Text style={styles.buttonText}>Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteBtn]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
        )}
        {getIdFamille() && (
          <TouchableOpacity
            style={[styles.button, styles.treeBtn]}
            onPress={() =>
                {
                  const id = getIdFamille()?.toString();
                  router.push(`/familles/${id}/`);
                }
            }
          >
            <Text style={styles.buttonText}>Voir l’arbre généalogique</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.backBtn]}
          onPress={() => router.push('/personnes')}
        >
          <Text style={styles.buttonText}>Retour à la liste</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photo: {
    width: 160,
    height: 160,
    borderRadius: 90,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#06b6d4',
    backgroundColor: '#1e293b',
  },
  ageBadge: {
    marginTop: 10,
    backgroundColor: '#facc15',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ageText: {
    color: '#1e293b',
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: '700',
    color: '#67e8f9',
    width: 130,
  },
  value: {
    color: '#e0e7ff',
    flexShrink: 1,
  },
  notesBox: {
    backgroundColor: '#0e7490',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  notes: {
    color: '#e0f2fe',
    fontSize: 15,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  editBtn: {
    backgroundColor: '#facc15',
  },
  deleteBtn: {
    backgroundColor: '#f87171',
  },
  backBtn: {
    marginTop: 18,
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    color: '#06b6d4',
    marginTop: 12,
    fontSize: 16,
  },
  notFound: {
    color: '#f87171',
    fontSize: 18,
    fontWeight: 'bold',
  },
  treeBtn: {
  marginTop: 12,
  backgroundColor: '#10b981',
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: 'center',
},
});
