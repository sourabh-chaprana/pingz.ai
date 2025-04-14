import React from "react";
import { StyleSheet, View, TouchableOpacity, Image, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";

interface ProPlanDetailsProps {
  onUpgrade: () => void;
  onSwitchPlan: () => void;
  onClose: () => void;
}

export default function ProPlanDetails({
  onUpgrade,
  onSwitchPlan,
  onClose,
}: ProPlanDetailsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Pro Plan</ThemedText>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.subtitle}>Here's what you get:</ThemedText>

      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <Ionicons name="document-text" size={24} color="#8B3DFF" />
          <ThemedText style={styles.featureText}>Business Templates</ThemedText>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="people" size={24} color="#8B3DFF" />
          <ThemedText style={styles.featureText}>Bulk Messaging</ThemedText>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="browsers" size={24} color="#8B3DFF" />
          <ThemedText style={styles.featureText}>Header & Footer Placements</ThemedText>
        </View>
      </View>

      <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
        <ThemedText style={styles.upgradeButtonText}>Upgrade to Pro</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.switchPlanButton} onPress={onSwitchPlan}>
        <ThemedText style={styles.switchPlanText}>
          Get Personal plan instead
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 24,
    color: '#000',
  },
  featuresList: {
    gap: 16,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#000',
  },
  upgradeButton: {
    backgroundColor: '#8B3DFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  switchPlanButton: {
    alignItems: 'center',
  },
  switchPlanText: {
    color: '#666',
    fontSize: 14,
  },
});
