import Select from "@/components/Select";
import { establishments } from "@/db/schema";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

const AddEstablishmentModal = ({ db, setMutations }) => {
  const [values, setValues] = useState({
    name: "",
    type: "",
    address: "",
  });
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

  const setType = (value) => {
    setValues((prev) => ({
      ...prev,
      type: value,
    }));
  };

  return (
    <>
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
            <Text style={styles.label}>Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              value={values.name}
              onChangeText={(value) => handleChange("name", value)}
            />

            <Text style={styles.label}>Type:</Text>
            <Select
              options={[
                { label: "Agriculture", value: "Agriculture" },
                { label: "Non-Agriculture", value: "Non-Agriculture" },
              ]}
              placeholder="Select type"
              valueState={[values.type, setType]}
            />

            <Text style={styles.label}>Address:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter address"
              value={values.address}
              onChangeText={(value) => handleChange("address", value)}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={[styles.actionButton, { marginRight: 8 }]}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={addRecord}>
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AddEstablishmentModal;
