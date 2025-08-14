import confirmAlert from "@/components/ConfirmAlert";
import NavBar from "@/components/NavBar/NavBar";
import * as schema from "@/db/schema";
import { establishments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles";

const HomeScreen = () => {
  const initialDb = useSQLiteContext();
  const db = drizzle(initialDb, { schema });

  const [records, setRecords] = useState([]);
  const [values, setValues] = useState({
    name: "",
    type: "",
    address: "",
  });

  const [mutations, setMutations] = useState(0);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const handleChange = (key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addRecord = async () => {
    try {
      await db.insert(establishments).values(values);

      setValues({
        name: "",
        type: "",
        address: "",
      });

      setIsAddModalVisible(false);
      setMutations((prev) => ++prev);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "An Error Eccurred");
    }
  };

  const deleteRecord = async (id) => {
    await db.delete(establishments).where(eq(establishments.id, id));
    setMutations((prev) => ++prev);
  };

  useEffect(() => {
    const getRecords = async () => {
      const data = await db.query.establishments.findMany();
      setRecords(data);
    };

    getRecords();
  }, [mutations]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <NavBar title="Wage Calculator" />

      {/* List of establishments */}
      <FlatList
        data={records}
        keyExtractor={(record) => record.id}
        renderItem={({ item }) => (
          <View style={styles.establishmentCard}>
            <Text style={styles.establishmentText}>{item.address}</Text>

            <TouchableOpacity
              onPress={() => {
                confirmAlert("Establishment", deleteRecord, item.id);
              }}
            >
              <Text style={{ ...styles.establishmentText, color: "red" }}>
                X
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Add Establishment Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Text style={styles.addText}>Add Establishment</Text>
      </TouchableOpacity>

      {/* Modal: Add Establishment Form */}
      <Modal
        animationType="slide"
        transparent
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.form}>
            <Text style={styles.label}>{isAddModalVisible}</Text>
            <Text style={styles.label}>Name:</Text>
            <TextInput
              style={styles.input}
              value={values.name}
              onChangeText={(value) => handleChange("name", value)}
            />

            <Text style={styles.label}>Type:</Text>
            <TextInput
              style={styles.input}
              value={values.type}
              onChangeText={(value) => handleChange("type", value)}
            />

            <Text style={styles.label}>Address:</Text>
            <TextInput
              style={styles.input}
              value={values.address}
              onChangeText={(value) => handleChange("address", value)}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={[styles.saveButton, { marginRight: 8 }]}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.saveText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addRecord}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;
