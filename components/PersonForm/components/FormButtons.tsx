import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';

interface FormButtonsProps {
  loading: boolean;
  mode: "add" | "edit";
  onSubmit: () => void;
  onReset?: () => void;
  disabled?: boolean;
}

export function FormButtons({ loading, mode, onSubmit, onReset, disabled = false }: FormButtonsProps) {
  return (
    <Animated.View entering={SlideInDown.delay(500)} style={styles.container}>
      <TouchableOpacity 
        style={[styles.submitButton, (loading || disabled) && styles.disabledButton]}
        onPress={onSubmit}
        disabled={loading || disabled}
      >
        {loading ? (
          <ActivityIndicator color="#064E3B" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>✓</Text>
        )}
        <Text style={styles.submitButtonText}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Text>
      </TouchableOpacity>
      
      {mode === "add" && onReset && (
        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <Text style={styles.resetButtonText}>Réinitialiser</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: "#064E3B",
    fontWeight: "bold",
    fontSize: 20,
  },
  resetButton: {
    backgroundColor: "#4B5563",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6,
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});