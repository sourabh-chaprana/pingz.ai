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
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { loading, error } = useSelector((state: RootState) => state.payment);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (visible) {
          if (showCheckout) {
            handleBackFromCheckout();
          } else {
            handleClose();
          }
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [visible, showCheckout]);

  const handlePlanSelect = async () => {
    try {
      setIsProcessing(true);
      const planPrice = currentPlan === "pro" ? 499 : 299;
      
      const initiateResult = await dispatch(
        initiatePayment(planPrice)
      ).unwrap();
      
      if (!initiateResult || !initiateResult.id) {
        throw new Error('Invalid response format');
      }

      setIsProcessing(false);
      setShowCheckout(true);
    } catch (error) {
      setIsProcessing(false);
      Alert.alert(
        "Error",
        error.message || "Failed to process request. Please try again."
      );
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

  const renderContent = () => {
    if (showCheckout) {
      return (
        <CheckoutScreen
          planType={currentPlan}
          onBack={() => setShowCheckout(false)}
          onClose={handleClose}
        />
      );
    }

    return currentPlan === "pro" ? (
      <ProPlanDetails
        onUpgrade={() => {
          handlePlanSelect();
        }}
        onSwitchPlan={() => setCurrentPlan("personal")}
        onClose={handleClose}
      />
    ) : (
      <PersonalPlanDetails
        onGetPlan={() => {
          handlePlanSelect();
        }}
        onSwitchPlan={() => setCurrentPlan("pro")}
        onClose={handleClose}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={() => {
        if (showCheckout) {
          setShowCheckout(false);
        } else {
          handleClose();
        }
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {renderContent()}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: Platform.OS === 'android' ? '80%' : '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
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
