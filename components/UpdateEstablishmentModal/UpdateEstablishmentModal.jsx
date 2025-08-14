import { establishments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

const UpdateEstablishmentModal = ({
  db,
  setMutations,
  values,
  setValues,
  isUpdateModalVisible,
  setIsUpdateModalVisible,
}) => {
  const handleChange = (key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateRecord = async () => {
    try {
      await db
        .update(establishments)
        .set(values)
        .where(eq(establishments.id, values.id));

      setIsUpdateModalVisible(false);
      setMutations((prev) => ++prev);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "An Error Eccurred");
    }
  };

  return (
    <>
      {/* Modal: Update Establishment Form */}

      <Modal
        animationType="slide"
        transparent
        visible={isUpdateModalVisible}
        onRequestClose={() => setIsUpdateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.form}>
            <Text style={styles.label}>{isUpdateModalVisible}</Text>
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

export default UpdateEstablishmentModal;
