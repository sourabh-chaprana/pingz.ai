import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserData } from "@/src/features/accounts/accountsThunk";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "@/src/store";
import PlanSelectionModal from "./payments/PlanSelectionModal";

export function ProfileHeader() {
  const dispatch = useDispatch<AppDispatch>();
  const [showPlanModal, setShowPlanModal] = useState(false);

  const { userData, loading } = useSelector(
    (state: RootState) => state.account
  );

  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);

  // Display loading state while fetching data
  if (loading && !userData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#8B3DFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        {userData?.profileImage ? (
          <Image
            source={{ uri: userData.profileImage }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Ionicons name="person" size={24} color="#8B3DFF" />
          </View>
        )}
        <View style={styles.profileInfo}>
          <ThemedText style={styles.name}>
            {userData?.firstName} {userData?.lastName || ""}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {userData?.email || ""}
          </ThemedText>
        </View>
        <TouchableOpacity>
          <Ionicons name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      {userData?.membership === "PRO" ? (
        <View style={styles.proButton}>
          <Ionicons
            name="star"
            size={20}
            color="#fff"
            style={styles.crownIcon}
          />
          <ThemedText style={styles.proText}>PRO</ThemedText>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.proButton}
          onPress={() => setShowPlanModal(true)}
        >
          <Ionicons
            name="star-outline"
            size={20}
            color="#fff"
            style={styles.crownIcon}
          />
          <ThemedText style={styles.proText}>Upgrade</ThemedText>
        </TouchableOpacity>
      )}

      <PlanSelectionModal
        visible={showPlanModal}
        onClose={() => setShowPlanModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  profilePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  proButton: {
    backgroundColor: "#8B3DFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
  },
  crownIcon: {
    marginRight: 8,
  },
  proText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
