import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiFetch, getPhotoUrl } from '../../../services/FetchAPI';

import { router, useFocusEffect } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;

function formatDateFR(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function FamilyMemberCard({ role, personne, onPress, special }: any) {
  return (
    <View style={[styles.card, special && styles.parentCard]}>
      {personne?.age && (
        <View style={styles.ageBadge}>
          <Text style={styles.ageText}>{personne.age} ans</Text>
        </View>
      )}
      <Text style={[styles.role, special && styles.parentRole]}>{role}</Text>
      <TouchableOpacity disabled={!personne} onPress={onPress} style={{ alignItems: 'center' }}>
        <Image
          source={{ uri: getPhotoUrl(personne?.photo) }}
          style={[styles.avatar, special && styles.parentAvatar]}
        />
        <Text style={[styles.name, special && styles.parentName]} numberOfLines={2} ellipsizeMode="tail">
          {personne ? `${personne.first_name} ${personne.last_name}` : 'Non renseigné'}
        </Text>
        {/* {personne?.age ? <Text style={[styles.age, special && styles.parentAge]}>{personne.age} ans</Text> : null} */}
        <Text style={styles.birthDate}>{formatDateFR(personne?.birth_date)}</Text>
</TouchableOpacity>
    </View>
  );
}

function getTargetId(m: any): number | null {
  const role = m.role;
  const person = m.personne;

  if (!person) return null;

  // 1. Cas des parents → pas de lien
  if (role === 'Père' || role === 'Mère') {
    return null;
  }

  // 2. Cas des grands-parents → lien vers le grand-père
  const isGrandParent = [
    'Grand-père paternel',
    'Grand-mère maternelle',
    'Grand-père maternel',
    'Grand-mère paternelle',
  ].includes(role);

  if (isGrandParent && person.gender === 'Femme') {
    return person.conjointId;
  }

  // 3. Cas des enfants ou petits-enfants
  const isChildOrDescendant = ['Enfant'].includes(role);

  if (isChildOrDescendant) {
    if (!person.conjointId) return null;

    if (person.gender === 'Homme') {
      return person.id;
    } else if (person.gender === 'Femme') {
      return person.conjointId;
    }
  }
  return person.id;
}


function renderGrid(members: any[], navigation: any, specialRoles: string[] = []) {
  // 2 colonnes : chaque ligne = 2 membres
  const rows = [];
  for (let i = 0; i < members.length; i += 2) {
    rows.push(members.slice(i, i + 2));
  }
  return rows.map((row, idx) => (
    <View key={idx} style={styles.gridRow}>
      {row.map((m: any, j: number) => (
        <FamilyMemberCard
          key={m.role + (m.personne?.id || j)}
          role={m.role}
          personne={m.personne}
          special={specialRoles.includes(m.role)}
          onPress={() => {
            const targetId = getTargetId(m);
            if (targetId) {
              router.push(`/familles/${targetId}/`);
            }
          }}
        />
      ))}
      {row.length === 1 && <View style={[styles.card, { opacity: 0 }]} />}
    </View>
  ));
}

export default function FamilleDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  // @ts-ignore
  const { id } = route.params || {};
  const [famille, setFamille] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);


  useFocusEffect(
      useCallback(() => {
        setLoading(true);
        apiFetch(`/familles/${id}/`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (!data || data.error) {
              setNotFound(true);
            } else {
              setFamille(data);
            }
            setLoading(false);
          });
      }, [id])
    );


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }
  if (notFound || !famille) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Famille non trouvée</Text>
      </View>
    );
  }

  const {
    pere,
    mere,
    enfants = [],
    grand_pere_paternel,
    grand_mere_paternelle,
    grand_pere_maternel,
    grand_mere_maternelle,
  } = famille;

  // Préparer les membres pour la grille
  const grandsParentsPaternels = [
    { role: 'Grand-père paternel', personne: grand_pere_paternel },
    { role: 'Grand-mère paternelle', personne: grand_mere_paternelle },
  ];
  const grandsParentsMaternels = [
    { role: 'Grand-père maternel', personne: grand_pere_maternel },
    { role: 'Grand-mère maternelle', personne: grand_mere_maternelle },
  ];
  const parents = [
    { role: 'Père', personne: pere },
    { role: 'Mère', personne: mere },
  ];
  const enfantsList = enfants.map((enfant: any) => ({ role: 'Enfant', personne: enfant })).sort((a, b) => b.personne.age - a.personne.age);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>{`Famille de ${pere?.first_name ?? ''} ${pere?.last_name ?? ''}`.trim()}</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grands-parents paternels</Text>
        {renderGrid(grandsParentsPaternels, navigation)}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grands-parents maternels</Text>
        {renderGrid(grandsParentsMaternels, navigation)}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parents</Text>
        {renderGrid(parents, navigation, ['Père', 'Mère'])}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enfants</Text>
        {enfantsList.length > 0 ? renderGrid(enfantsList, navigation) : <Text style={styles.empty}>Aucun enfant trouvé.</Text>}
      </View>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Retour à la liste</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 colonnes, marges

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827', paddingTop: 24, paddingHorizontal: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#67e8f9', textAlign: 'center', marginBottom: 22 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#06b6d4', fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginLeft: 8 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  card: { backgroundColor: '#1f2937', borderRadius: 16, alignItems: 'center', padding: 16, marginHorizontal: 4, width: CARD_WIDTH, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  role: { color: '#67e8f9', fontSize: 13, marginTop: 14, marginBottom: 6, fontWeight: '600' },
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#06b6d4', backgroundColor: '#1e293b', marginBottom: 8 },
  name: { fontWeight: 'bold', color: '#fff', fontSize: 15, textAlign: 'center', maxWidth: 100 },
  age: { color: '#67e8f9', fontSize: 13, marginTop: 2, textAlign: 'center', fontWeight: '600' },
  birthDate: { color: '#94a3b8', fontSize: 12, marginTop: 2, textAlign: 'center' },
  empty: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
  loadingText: { color: '#06b6d4', marginTop: 12, fontSize: 16 },
  notFound: { color: '#f87171', fontSize: 18, fontWeight: 'bold' },
  backBtn: { alignSelf: 'center', marginTop: 28, backgroundColor: '#334155', borderRadius: 8, paddingHorizontal: 28, paddingVertical: 12 },
  backBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  parentCard: {
    borderWidth: 2,
    borderColor: '#facc15', // jaune doré
    backgroundColor: '#23272e',
    shadowColor: '#facc15',
    shadowOpacity: 0.2,
    elevation: 6,
  },
  parentRole: {
    color: '#facc15',
    fontWeight: 'bold',
    fontSize: 16,
  },
  parentAvatar: {
    borderColor: '#facc15',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
  },
  parentName: {
    color: '#facc15',
    fontSize: 17,
  },
  parentAge: {
    color: '#facc15',
    fontWeight: 'bold',
  },
   ageBadge: {
  position: 'absolute',
  top: 0,
  right: 0,
  backgroundColor: '#facc15',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderBottomLeftRadius: 8,
  borderTopRightRadius: 12,
},

ageText: {
  color: '#0f172a',
  fontWeight: 'bold',
  fontSize: 12,
},
}); 