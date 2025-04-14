import React from "react";
import { StyleSheet, View, TouchableOpacity, Image, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";

interface ProPlanDetailsProps {
  onUpgrade: () => void;
  onSwitchPlan: () => void;
  onClose: () => void;
}

export default function ProPlanDetails({
  onUpgrade,
  onSwitchPlan,
  onClose,
}: ProPlanDetailsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Choose Your Plan</ThemedText>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Pro Plan Section */}
      <View style={styles.planContainer}>
        <View style={styles.proCard}>
          <View style={styles.planHeaderContainer}>
            <ThemedText style={styles.planTitle}>Pro Plan</ThemedText>
            <ThemedText style={styles.priceText}>₹499<ThemedText style={styles.yearText}>/year</ThemedText></ThemedText>
          </View>
          
          <View style={styles.featuresList}>

          <View style={styles.featureItem}>
              <Ionicons name="star" size={24} color="#8B3DFF" />
              <ThemedText style={styles.featureText}>Includes Personal Plan</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="document-text" size={24} color="#8B3DFF" />
              <ThemedText style={styles.featureText}>Business Templates</ThemedText>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="people" size={24} color="#8B3DFF" />
              <ThemedText style={styles.featureText}>Bulk Messaging</ThemedText>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="browsers" size={24} color="#8B3DFF" />
              <ThemedText style={styles.featureText}>Header & Footer Placements</ThemedText>
            </View>

           
          </View>

          <TouchableOpacity style={styles.buyButton} onPress={onUpgrade}>
            <ThemedText style={styles.buyButtonText}>Buy Now</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Personal Plan Section */}
        <View style={styles.personalCard}>
          <View style={styles.planHeaderContainer}>
            <ThemedText style={styles.planTitle}>Personal Plan</ThemedText>
            <ThemedText style={styles.priceText}>₹399<ThemedText style={styles.yearText}>/year</ThemedText></ThemedText>
          </View>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="calendar-outline" size={22} color="#8B3DFF" />
              <ThemedText style={styles.featureText}>
                Festival & Birthday Templates
              </ThemedText>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="logo-whatsapp" size={22} color="#8B3DFF" />
              <ThemedText style={styles.featureText}>
                Share on WhatsApp
              </ThemedText>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="share-social-outline" size={22} color="#8B3DFF" />
              <ThemedText style={styles.featureText}>
                Social Media Publishing
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity style={styles.buyButton} onPress={onSwitchPlan}>
            <ThemedText style={styles.buyButtonText}>Buy Now</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  planContainer: {
    marginTop: 10,
  },
  proCard: {
    backgroundColor: '#222222',
    borderRadius: 12,
    
    padding: 20 ,
    marginBottom: 20,
    marginTop: 0,
    // borderWidth: 2,
    // borderColor: '#8B3DFF',
  },
  personalCard: {
    backgroundColor: '#222222',
    borderRadius: 12,
    padding: 20,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 12,
    // backgroundColor: '#2D2D2D',
    // borderRadius: 8,
    // gap: 12,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#fff',
  },
  buyButton: {
    backgroundColor: '#8B3DFF',
    borderRadius: 8,
    padding: 5,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  planHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  yearText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '400',
  },
});
