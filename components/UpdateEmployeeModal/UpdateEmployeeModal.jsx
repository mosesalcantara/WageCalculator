import { eq } from "drizzle-orm";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "@/components/UpdateEstablishmentModal/styles";
import { employees } from "@/db/schema";

const UpdateEmployeeModal = ({
  db,
  setMutations,
  valuesState,
  isUpdateModalVisibleState,
}) => {
  const [values, setValues] = valuesState;
  const [isUpdateModalVisible, setIsUpdateModalVisible] =
    isUpdateModalVisibleState;

  const handleChange = (key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateRecord = async () => {
    try {
      await db
        .update(employees)
        .set(values)
        .where(eq(employees.id, values.id));

      setIsUpdateModalVisible(false);
      setMutations((prev) => ++prev);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "An Error Eccurred");
    }
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent
        visible={isUpdateModalVisible}
        onRequestClose={() => setIsUpdateModalVisible(false)}
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
                style={[styles.updateButton, { marginRight: 8 }]}
                onPress={() => setIsUpdateModalVisible(false)}
              >
                <Text style={styles.updateText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => {
                  updateRecord();
                }}
              >
                <Text style={styles.updateText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default UpdateEmployeeModal;
