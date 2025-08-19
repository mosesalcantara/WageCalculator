import { styles } from "@/components/AddEstablishmentModal/styles";
import { employees } from "@/db/schema";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

const AddEmployeeModal = ({ db, setMutations, parent }) => {
  const [values, setValues] = useState({
    first_name: "",
    last_name: "",
    rate: "",
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
      await db
        .insert(employees)
        .values({ ...values, establishment_id: parent.id });

      setValues({
        first_name: "",
        last_name: "",
        rate: "",
      });

      setIsAddModalVisible(false);
      setMutations((prev) => ++prev);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "An Error Eccurred");
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Text style={styles.addText}>Add Employee</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.form}>
            <Text style={styles.label}>First Name:</Text>
            <TextInput
              style={styles.input}
              value={values.first_name}
              onChangeText={(value) => handleChange("first_name", value)}
            />

            <Text style={styles.label}>Last Name:</Text>
            <TextInput
              style={styles.input}
              value={values.last_name}
              onChangeText={(value) => handleChange("last_name", value)}
            />

            <Text style={styles.label}>Rate:</Text>
            <TextInput
              style={styles.input}
              value={values.rate}
              onChangeText={(value) => handleChange("rate", value)}
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
    </>
  );
};

export default AddEmployeeModal;
