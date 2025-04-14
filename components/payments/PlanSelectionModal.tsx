import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
import ProPlanDetails from "./ProPlanDetails";
import PersonalPlanDetails from "./PersonalPlanDetails";
import CheckoutScreen from "./CheckoutScreen";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { resetPaymentState } from "@/src/features/payment/paymentSlice";
import { initiatePayment } from "@/src/features/payment/paymentThunk";

const { width } = Dimensions.get("window");

interface PlanSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PlanSelectionModal({
  visible,
  onClose,
}: PlanSelectionModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [currentPlan, setCurrentPlan] = useState<"pro" | "personal">("pro");
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { loading, error } = useSelector((state: RootState) => state.payment);

  const handlePlanSelect = async () => {
    try {
      setIsProcessing(true);

      // Get plan price based on selection
      const planPrice = currentPlan === "pro" ? 499 : 299;

      // Call the initiate payment API to get order ID
      console.log("Initiating payment for:", planPrice);

      const initiateResult = await dispatch(
        initiatePayment(planPrice)
      ).unwrap();
      console.log("Initiate payment response:", initiateResult);

      if (!initiateResult || !initiateResult.id) {
        console.error("Invalid response format:", initiateResult);
        setIsProcessing(false);
        Alert.alert(
          "Error",
          "Failed to initiate payment. Invalid response format."
        );
        return;
      }

      // Now show the checkout screen with the order ID
      setIsProcessing(false);
      setShowCheckout(true);
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      setIsProcessing(false);

      // More detailed error message
      const errorMessage =
        error.message || "Failed to process request. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
  };

  const handleClose = () => {
    setShowCheckout(false);
    setCurrentPlan("pro");
    dispatch(resetPaymentState());
    onClose();
  };

  // Loading overlay during API calls
  const renderLoadingOverlay = () => {
    if (!isProcessing) return null;

    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B3DFF" />
          <ThemedText style={styles.loadingText}>Processing...</ThemedText>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      {renderLoadingOverlay()}

      <View style={styles.modalOverlay}>
        {showCheckout ? (
          <CheckoutScreen
            planType={currentPlan}
            onBack={handleBackFromCheckout}
            onClose={handleClose}
          />
        ) : (
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              disabled={isProcessing}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <ScrollView 
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
            >
              {currentPlan === "pro" ? (
                <ProPlanDetails
                  onUpgrade={handlePlanSelect}
                  onSwitchPlan={() => setCurrentPlan("personal")}
                />
              ) : (
                <PersonalPlanDetails
                  onGetPlan={handlePlanSelect}
                  onSwitchPlan={() => setCurrentPlan("pro")}
                />
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    maxWidth: 300,
  },
  loadingText: {
    color: '#333',
    marginTop: 16,
    fontSize: 16,
  },
});
