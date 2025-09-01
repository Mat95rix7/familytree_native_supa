import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleAlert as AlertCircle } from 'lucide-react-native';

interface ErrorDisplayProps {
  errors: string[];
}

export function ErrorDisplay({ errors }: ErrorDisplayProps) {
  if (errors.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AlertCircle color="#EF4444" size={20} />
        <Text style={styles.title}>Erreurs de validation</Text>
      </View>
      {errors.map((error, index) => (
        <Text key={index} style={styles.errorText}>
          • {error}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    lineHeight: 20,
  },
});