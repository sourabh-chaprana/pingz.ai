import React from "react";
import { StyleSheet, View, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";

interface CheckoutScreenProps {
  planType: "pro" | "personal";
  onBack: () => void;
  onClose: () => void;
}

export default function CheckoutScreen({
  planType,
  onBack,
  onClose,
}: CheckoutScreenProps) {
  const planPrice = planType === "pro" ? "₹499/month" : "₹299/month";
  const planName = planType === "pro" ? "Pro Plan" : "Personal Plan";

  return (
    <View style={styles.container}>
      <View style={styles.checkoutBox}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>Checkout</ThemedText>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.title}>Continue</ThemedText>

          <ThemedText style={styles.description}>
            By clicking on pay you'll purchase your plan subscription of{" "}
            {planPrice}
          </ThemedText>

          <TouchableOpacity style={styles.payButton}>
            <ThemedText style={styles.payButtonText}>Pay</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={onBack}>
            <ThemedText style={styles.termsText}>
              Please read the terms and conditions.
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  checkoutBox: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#121212",
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContainer: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 24,
  },
  payButton: {
    backgroundColor: "#8B3DFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  termsText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
