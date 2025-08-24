import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ListRenderItem, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiFetch, getPhotoUrl } from '../../services/FetchAPI';

// Définition du type pour une personne/famille
type Famille = {
  id: number;
  first_name: string;
  last_name: string;
  photo?: string;
};

export default function FamillesList() {
  const [peres, setPeres] = useState<Famille[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
      useCallback(() => {
        setLoading(true);
        apiFetch('/familles')
          .then(res => res.json())
          .then(data => {
            setPeres(data);
            setLoading(false);
          });
      }, [])
    );

   const renderItem: ListRenderItem<Famille> = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={()=>{ router.push(`/familles/${item.id}/`) }}
    >
      <Image
        source={{ uri: getPhotoUrl(item.photo) }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{(item.first_name ?? '') + ' ' + (item.last_name ?? '')}</Text>
      <View style={styles.badgeContainer}>
        <Text style={styles.badge}>Voir la famille</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!peres.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Aucune Famille trouvée.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des Familles</Text>
      <FlatList
        data={peres}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827', paddingTop: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#67e8f9', textAlign: 'center', marginBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: '#1f2937', borderRadius: 16, alignItems: 'center', padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#06b6d4', marginBottom: 12 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  badgeContainer: { marginTop: 4 },
  badge: { backgroundColor: '#67e8f9', color: '#1e293b', fontWeight: 'bold', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
  loadingText: { color: '#06b6d4', marginTop: 12, fontSize: 16 },
  empty: { backgroundColor: '#fef9c3', color: '#92400e', borderRadius: 8, padding: 16, textAlign: 'center', fontSize: 16 },
}); 