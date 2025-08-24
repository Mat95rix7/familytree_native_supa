// components/PersonCard.tsx
import { useRouter } from 'expo-router';
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getPhotoUrl } from "../services/FetchAPI";

type Personne = {
  id: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  birth_date?: string;
  birth_place?: string;
  photo?: string;
  father?: { first_name?: string };
};

type Props = {
  personne: Personne;
};

export default function PersonCard({ personne }: Props) {
  const router = useRouter();

  const birthYear = personne.birth_date
    ? new Date(personne.birth_date).getFullYear()
    : "Né(e) ?";

  const photoSrc = { uri: getPhotoUrl(personne.photo) };

  const handlePress = () => {
    // Naviguer vers l'écran détail de la personne
    router.push(`/personnes/${personne.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image source={photoSrc} style={styles.photo} />
      <View style={styles.info}>
        <Text style={styles.name}>
          {personne.last_name} {personne.first_name}
        </Text>
        <Text style={styles.text}>
          {personne.gender === "Homme" ? "Fils de " : "Fille de "}
          <Text style={styles.subText}>
            {personne.father?.first_name || "Inconnu"}
          </Text>
        </Text>
        <Text style={styles.text}>
          {personne.gender || "Genre ?"} – {personne.birth_place || "Lieu ?"}
        </Text>
      </View>
      <View style={styles.birthYear}>
        <Text style={styles.birthYearText}>{birthYear}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 8,
    position: "relative",
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#06b6d4",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: "#22d3ee",
    fontWeight: "bold",
    fontSize: 16,
  },
  text: {
    color: "#9ca3af",
    fontSize: 14,
  },
  subText: {
    color: "#d1d5db",
  },
  birthYear: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#facc15",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 8,
  },
  birthYearText: {
    color: "#111827",
    fontWeight: "bold",
    fontSize: 14,
  },
});
