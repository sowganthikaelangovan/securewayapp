import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSecureway, addContact, removeContact, Contact } from "@/lib/secureway-store";
import { AppHeader } from "../components/AppHeader";
import { ContactCard } from "../components/ContactCard";

export function ContactsScreen() {
  const { contacts } = useSecureway();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("Parent");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Missing Fields", "Please provide contact name and phone number.");
      return;
    }
    try {
      await addContact({ name, phone, relation });
      setName("");
      setPhone("");
      setRelation("Parent");
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add contact.");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeContact(id);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to remove contact.");
    }
  };

  // Import directly from Device Phonebook Contacts
  const handleImportFromPhonebook = async () => {
    setLoading(true);
    try {
      if (Platform.OS === "web") {
        Alert.alert("Phone Contacts", "Please type contact details manually on web browser.");
        setModalVisible(true);
        return;
      }

      const ExpoContacts = await import("expo-contacts");
      const { status } = await ExpoContacts.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Contact access is needed to pick emergency contacts directly from your phone address book."
        );
        return;
      }

      const contact = await ExpoContacts.presentContactPickerAsync();
      if (contact) {
        const contactName = contact.name || [contact.firstName, contact.lastName].filter(Boolean).join(" ");
        const rawPhone = contact.phoneNumbers && contact.phoneNumbers.length > 0 ? contact.phoneNumbers[0].number : "";

        if (contactName && rawPhone) {
          await addContact({ name: contactName, phone: rawPhone, relation: "Family" });
          Alert.alert("Contact Added", `${contactName} (${rawPhone}) added to your emergency circle!`);
        } else {
          Alert.alert("No Phone Number", "The selected contact does not have a valid phone number.");
        }
      }
    } catch (err: any) {
      console.warn("Contact picker note:", err);
      // Fallback to manual entry modal if contact picker is dismissed
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Emergency Contacts" subtitle="Your trusted emergency circle" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBanner}>
          <Ionicons name="people" size={20} color="#8b5cf6" />
          <Text style={styles.infoText}>
            Contacts listed here will automatically receive live SMS & location tracking alerts when SOS is pressed.
          </Text>
        </View>

        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="person-add-outline" size={48} color="#475569" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
            <Text style={styles.emptySub}>Add your family or friends from phonebook to stay protected.</Text>
          </View>
        ) : (
          contacts.map((contact: Contact) => (
            <ContactCard key={contact.id} contact={contact} onRemove={handleRemove} />
          ))
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.importBtn}
          activeOpacity={0.85}
          onPress={handleImportFromPhonebook}
          disabled={loading}
        >
          <Ionicons name="book" size={18} color="#8b5cf6" />
          <Text style={styles.importBtnText}>Import Phonebook</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="person-add" size={18} color="#ffffff" />
          <Text style={styles.fabText}>Add Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Add Contact Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Emergency Contact</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sarah Jenkins"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 9876543210"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>RELATIONSHIP</Text>
              <View style={styles.relationPicker}>
                {["Parent", "Spouse", "Sibling", "Friend"].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.relationTag, relation === r && styles.relationTagActive]}
                    onPress={() => setRelation(r)}
                  >
                    <Text style={[styles.relationText, relation === r && styles.relationTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8} onPress={handleAdd}>
              <Text style={styles.submitBtnText}>Save Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d16",
  },
  content: {
    paddingBottom: 110,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.25)",
    gap: 12,
  },
  infoText: {
    color: "#cbd5e1",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
  emptySub: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: 12,
  },
  importBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e293b",
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.4)",
    gap: 8,
  },
  importBtnText: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "700",
  },
  fab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fabText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#131b2e",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#f8fafc",
    fontSize: 15,
  },
  relationPicker: {
    flexDirection: "row",
    gap: 8,
  },
  relationTag: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  relationTagActive: {
    backgroundColor: "#8b5cf6",
  },
  relationText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  relationTextActive: {
    color: "#ffffff",
  },
  submitBtn: {
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
