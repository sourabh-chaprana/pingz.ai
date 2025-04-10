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

      <View style={styles.descriptionContainer}>
        <Ionicons name="sparkles" size={24} color="#fff" style={styles.icon} />
        <ThemedText style={styles.description}>
          Perfect for individuals who love sending creative, personalized
          messages for every occasion.
        </ThemedText>
      </View>

      <ThemedText style={styles.sectionTitle}>Here's what you get:</ThemedText>

      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <Ionicons
            name="calendar"
            size={24}
            color="#fff"
            style={styles.featureIcon}
          />
          <View style={styles.featureTextContainer}>
            <ThemedText style={styles.featureTitle}>
              Festival & Birthday Templates
            </ThemedText>
            <ThemedText style={styles.featureDescription}>
              Never miss a special day with ready-to-use birthday & festival
              templates.
            </ThemedText>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons
            name="logo-whatsapp"
            size={24}
            color="#fff"
            style={styles.featureIcon}
          />
          <View style={styles.featureTextContainer}>
            <ThemedText style={styles.featureTitle}>
              Share on WhatsApp
            </ThemedText>
            <ThemedText style={styles.featureDescription}>
              Instantly send your messages with just one click.
            </ThemedText>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons
            name="share-social"
            size={24}
            color="#fff"
            style={styles.featureIcon}
          />
          <View style={styles.featureTextContainer}>
            <ThemedText style={styles.featureTitle}>
              Social Media Publishing
            </ThemedText>
            <ThemedText style={styles.featureDescription}>
              Post directly to your favorite social media platforms.
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.getPlanButton} onPress={onGetPlan}>
          <ThemedText style={styles.getPlanButtonText}>
            Get Personal Plan
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchPlanButton}
          onPress={onSwitchPlan}
        >
          <ThemedText style={styles.switchPlanText}>
            Get Pro plan instead
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 61, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  icon: {
    marginRight: 12,
  },
  description: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.7)",
  },
  actionsContainer: {
    marginTop: 8,
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
    fontWeight: "600",
  },
  switchPlanButton: {
    alignItems: "center",
    padding: 12,
  },
  switchPlanText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
  },
});
