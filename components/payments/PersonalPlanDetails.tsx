import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";

interface PersonalPlanDetailsProps {
  onGetPlan: () => void;
  onSwitchPlan: () => void;
}

export default function PersonalPlanDetails({
  onGetPlan,
  onSwitchPlan,
}: PersonalPlanDetailsProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Personal Plan</ThemedText>
      
      <ThemedText style={styles.subtitle}>Here's what you get:</ThemedText>

      {/* Feature Items */}
      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <Ionicons 
            name="calendar-outline" 
            size={22} 
            color="#8B3DFF" 
            style={styles.featureIcon}
          />
          <ThemedText style={styles.featureText}>
            Festival & Birthday Templates
          </ThemedText>
        </View>

        <View style={styles.featureItem}>
          <Ionicons 
            name="logo-whatsapp" 
            size={22} 
            color="#8B3DFF" 
            style={styles.featureIcon}
          />
          <ThemedText style={styles.featureText}>
            Share on WhatsApp
          </ThemedText>
        </View>

        <View style={styles.featureItem}>
          <Ionicons 
            name="share-social-outline" 
            size={22} 
            color="#8B3DFF" 
            style={styles.featureIcon}
          />
          <ThemedText style={styles.featureText}>
            Social Media Publishing
          </ThemedText>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.getPlanButton} onPress={onGetPlan}>
        <ThemedText style={styles.getPlanButtonText}>
          Get Personal Plan
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.switchPlanButton} onPress={onSwitchPlan}>
        <ThemedText style={styles.switchPlanText}>
          Get Pro plan instead
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
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    marginBottom: 24,
  },
  featuresList: {
    marginBottom: 24,
    gap: 12, // Space between feature items
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  featureIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#000",
    flex: 1,
    fontWeight: "400",
  
  },
  getPlanButton: {
    backgroundColor: "#8B3DFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  getPlanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  switchPlanButton: {
    alignItems: "center",
  },
  switchPlanText: {
    color: "#666",
    fontSize: 14,
  },
});
