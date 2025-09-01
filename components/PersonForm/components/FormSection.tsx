import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';

interface FormSectionProps {
  title: string;
  emoji?: string;
  delay?: number;
  children: React.ReactNode;
}

export function FormSection({ title, emoji, delay = 0, children }: FormSectionProps) {
  return (
    <Animated.View entering={SlideInDown.delay(delay)} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {emoji} {title}
        </Text>
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#67E8F9",
  },
});