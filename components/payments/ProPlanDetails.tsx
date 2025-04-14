import React from "react";
import { StyleSheet, View, TouchableOpacity, Image, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";

interface ProPlanDetailsProps {
  onUpgrade: () => void;
  onSwitchPlan: () => void;
}

export default function ProPlanDetails({
  onUpgrade,
  onSwitchPlan,
}: ProPlanDetailsProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Pro Plan</ThemedText>

      {/* <View style={styles.descriptionContainer}>
        <Ionicons name="briefcase" size={24} color="#fff" style={styles.icon} />
        <ThemedText style={styles.description}>
          Designed for businesses, influencers, and marketers who need advanced
          messaging features.
        </ThemedText>
      </View> */}

      <ThemedText style={styles.sectionTitle}>Here's what you get:</ThemedText>

      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <Ionicons
            name="document-text"
            size={24}
            color="#fff"
            style={styles.featureIcon}
          />
          <View style={styles.featureTextContainer}>
            <ThemedText style={styles.featureTitle}>
              Business Templates
            </ThemedText>
            {/* <ThemedText style={styles.featureDescription}>
              Access exclusive high-quality templates and design elements
            </ThemedText> */}
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons
            name="people"
            size={24}
            color="#fff"
            style={styles.featureIcon}
          />
          <View style={styles.featureTextContainer}>
            <ThemedText style={styles.featureTitle}>Bulk Messaging</ThemedText>
            {/* <ThemedText style={styles.featureDescription}>
              Expand your reach with web-based bulk messaging.
            </ThemedText> */}
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons
            name="browsers"
            size={24}
            color="#fff"
            style={styles.featureIcon}
          />
          <View style={styles.featureTextContainer}>
            <ThemedText style={styles.featureTitle}>
              Header & Footer Placements
            </ThemedText>
            {/* <ThemedText style={styles.featureDescription}>
              Customize message layouts for a professional touch.
            </ThemedText> */}
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <ThemedText style={styles.upgradeButtonText}>
            Upgrade to Pro
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchPlanButton}
          onPress={onSwitchPlan}
        >
          <ThemedText style={styles.switchPlanText}>
            Get Personal plan instead
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
    color: "#111",
    marginBottom: 16,
    textAlign: "center",
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  icon: {
    marginRight: 12,
    color: "#8B3DFF",
  },
  description: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  featureIcon: {
    marginRight: 16,
    marginTop: 2,
    color: "#8B3DFF",
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    color: "#666",
  },
  actionsContainer: {
    marginTop: 8,
  },
  upgradeButton: {
    backgroundColor: "#8B3DFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchPlanButton: {
    alignItems: "center",
    padding: 12,
  },
  switchPlanText: {
    color: "#666",
    fontSize: 16,
  },
  featureItemShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
