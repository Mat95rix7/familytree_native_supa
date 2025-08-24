import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PersonCard from "../../components/PersonCard";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../services/FetchAPI";

export default function PersonnesList() {
  const [personnes, setPersonnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const { role } = useAuth();
  const isAdmin = role === "admin";

  useEffect(() => {
    apiFetch("/personnes")
      .then((res) => res.json())
      .then((data) => {
        setPersonnes(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement:", error);
        setLoading(false);
        Alert.alert("Erreur", "Impossible de charger les données");
      });
  }, []);

  const sortOptions = [
    { key: "last_name", label: "Nom" },
    { key: "first_name", label: "Prénom" },
    { key: "gender", label: "Genre" },
    { key: "birth_date", label: "Année" },
  ];

  // Recherche
  const filtered = personnes.filter((p) =>
    `${p.first_name} ${p.last_name} ${p.birth_place}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Tri
  const sorted = [...filtered].sort((a, b) => {
    const key = sortConfig.key;
    if (!key) return 0;

    let aVal = a[key] || "";
    let bVal = b[key] || "";

    if (key === "birth_date") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else {
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();
    }

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const handleAddPerson = () => {
    router.push("/personnes/new");
  };

  const renderSortButton = ({ item }) => (
    <TouchableOpacity
      key={item.key}
      style={[
        styles.sortButton,
        sortConfig.key === item.key ? styles.activeSortButton : styles.inactiveSortButton
      ]}
      onPress={() => handleSort(item.key)}
    >
      <Text style={styles.sortButtonText}>
        {item.label}{" "}
        {sortConfig.key === item.key ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
      </Text>
    </TouchableOpacity>
  );

  const renderPersonCard = ({ item }) => (
    <PersonCard personne={item} />
  );

  const renderHeader = () => (
    <View>
      {/* Titre */}
      <Text style={styles.title}>
        Liste des personnes ({sorted.length})
      </Text>

      {/* Barre de recherche et bouton */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchLabel}>Rechercher :</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Nom, prénom, lieu..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        {isAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPerson}
          >
            <Text style={styles.addButtonText}>+ Ajouter une personne</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tri */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Trier par :</Text>
        <View style={styles.sortButtonsContainer}>
          {sortOptions.map((option) => renderSortButton({ item: option }))}
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchTerm
          ? `Aucune personne trouvée pour "${searchTerm}"`
          : "Aucune personne trouvée."}
      </Text>
    </View>
  );

  const renderFooter = () => (
    searchTerm ? (
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>
          {sorted.length} personne{sorted.length > 1 ? "s" : ""} trouvée
          {sorted.length > 1 ? "s" : ""}
        </Text>
      </View>
    ) : null
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06B6D4" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        renderItem={renderPersonCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
  },
  loadingText: {
    color: "#06B6D4",
    fontSize: 18,
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#67E8F9",
    marginBottom: 24,
  },
  searchContainer: {
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  searchLabel: {
    color: "#E5E7EB",
    fontWeight: "500",
    minWidth: 80,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#374151",
    color: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#4B5563",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#0891B2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  sortContainer: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  sortLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 8,
  },
  sortButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeSortButton: {
    backgroundColor: "#0891B2",
  },
  inactiveSortButton: {
    backgroundColor: "#374151",
  },
  sortButtonText: {
    color: "white",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
  },
  resultContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  resultText: {
    color: "#67E8F9",
    fontSize: 16,
  },
});