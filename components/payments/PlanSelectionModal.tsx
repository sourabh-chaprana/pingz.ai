import React, { useState, useEffect } from "react";
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
  BackHandler,
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
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlanSelect = async (planType: "pro" | "personal") => {
    try {
      setIsProcessing(true);
      const planPrice = planType === "pro" ? 499 : 399;
      
      const initiateResult = await dispatch(
        initiatePayment(planPrice)
      ).unwrap();
      
      if (!initiateResult || !initiateResult.id) {
        throw new Error('Invalid response format');
      }

      // Here you can directly open your payment gateway/interface
      // Instead of showing the checkout modal
      // Example: openPaymentGateway(initiateResult.id);

    } catch (error) {
      setIsProcessing(false);
      Alert.alert(
        "Error",
        error.message || "Failed to process request. Please try again."
      );
    }
  };

  const handleClose = () => {
    setCurrentPlan("pro");
    dispatch(resetPaymentState());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <ProPlanDetails
              onUpgrade={() => handlePlanSelect("pro")}
              onSwitchPlan={() => handlePlanSelect("personal")}
              onClose={handleClose}
            />
          </View>
        </View>
      </View>

      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B3DFF" />
            <ThemedText style={styles.loadingText}>Processing...</ThemedText>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: Platform.OS === 'android' ? '90%' : '95%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
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
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
