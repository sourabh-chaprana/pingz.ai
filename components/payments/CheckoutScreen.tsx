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
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>Checkout</ThemedText>
        
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Continue</ThemedText>
          <ThemedText style={styles.priceText}>
            By clicking on pay you'll purchase your plan subscription of ₹{planPrice}/month
          </ThemedText>
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
          <ThemedText style={styles.payButtonText}>Pay</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.termsContainer}>
          <ThemedText style={styles.termsText}>
            Please read the terms and conditions.
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#222222',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 15,
    color: '#aaa',
    lineHeight: 20,
  },
  payButton: {
    backgroundColor: '#8B3DFF',
    borderRadius: 8,
    padding: 5,
    alignItems: 'center',
    marginBottom: 16,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    fontSize: 14,
    color: '#aaa',
    textDecorationLine: 'underline',
  },
});
