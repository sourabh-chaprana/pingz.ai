import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { RAZORPAY_KEY_ID } from "./razorpayConfig";
import RazorpayCheckout from "react-native-razorpay";

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
  const { orderData } = useSelector((state: RootState) => state.payment);
  const { userData } = useSelector((state: RootState) => state.account);

  const planPrice = planType === "pro" ? 499 : 299;
  const planName = planType === "pro" ? "Pro Plan" : "Personal Plan";

  // Debug log when component mounts
  useEffect(() => {
    console.log("CheckoutScreen mounted with order data:", orderData);
  }, [orderData]);

  const handlePayNow = async () => {
    try {
      // Check if we have order data
      if (!orderData || !orderData.id) {
        console.error("No order data available:", orderData);
        Alert.alert("Error", "Payment data not found. Please try again.");
        return;
      }

      const orderId = orderData.id;
      console.log("Opening Razorpay with order ID:", orderId);

      // Check if RazorpayCheckout is available
      if (!RazorpayCheckout) {
        console.error("RazorpayCheckout module is not available");
        Alert.alert("Error", "Payment gateway not available on this device.");
        return;
      }

      // Open Razorpay checkout
      const options = {
        description: `Subscription to ${planName}`,
        image: "https://pingz.ai/logo.png",
        currency: "INR",
        key: RAZORPAY_KEY_ID,
        amount: planPrice * 100, // amount in smallest currency unit (paise)
        name: "Pingz.ai",
        order_id: orderId,
        prefill: {
          email: userData?.email || "",
          contact: userData?.phoneNumber || "",
          name: `${userData?.firstName || ""} ${userData?.lastName || ""}`,
        },
        theme: { color: "#8B3DFF" },
      };

      console.log("Razorpay options:", JSON.stringify(options, null, 2));

      // Use a more defensive approach when calling RazorpayCheckout
      try {
        // For debugging
        console.log("RAZORPAY_KEY_ID:", RAZORPAY_KEY_ID);
        console.log("RazorpayCheckout type:", typeof RazorpayCheckout);
        console.log(
          "RazorpayCheckout methods:",
          Object.keys(RazorpayCheckout || {})
        );

        const paymentObject = await RazorpayCheckout.open(options);
        console.log("Payment successful:", paymentObject);

        Alert.alert(
          "Payment Successful",
          `Your ${planName} subscription is now active!`,
          [{ text: "OK", onPress: onClose }]
        );
      } catch (razorpayError) {
        console.error("Razorpay error:", razorpayError);
        Alert.alert(
          "Payment Failed",
          razorpayError.description || "Something went wrong with your payment"
        );
      }
    } catch (error: any) {
      console.error("Error handling payment:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to process payment. Please try again."
      );
    }
  };

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
            By clicking on pay you'll purchase your plan subscription of ₹
            {planPrice}/month
          </ThemedText>

          <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
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
    height: 56,
    justifyContent: "center",
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
  errorText: {
    color: "#ff4444",
    marginBottom: 16,
    textAlign: "center",
  },
});
