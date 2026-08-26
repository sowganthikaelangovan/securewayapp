import React from "react";
import { View, Text, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Contact } from "@/lib/secureway-store";

interface ContactCardProps {
  contact: Contact;
  onRemove: (id: string) => void;
}

export function ContactCard({ contact, onRemove }: ContactCardProps) {
  const handleCall = () => {
    const cleaned = contact.phone.replace(/[^\d+]/g, "");
    Linking.openURL(`tel:${cleaned}`).catch((err: any) => console.error("Call failed", err));
  };

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color="#38bdf8" />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.phone}>{contact.phone}</Text>
        {contact.relation ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{contact.relation}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.callBtn} activeOpacity={0.8} onPress={handleCall}>
          <Ionicons name="call" size={16} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.7} onPress={() => onRemove(contact.id)}>
          <Ionicons name="trash" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131b2e",
    borderRadius: 20,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
  phone: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(148, 163, 184, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  tagText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
});
