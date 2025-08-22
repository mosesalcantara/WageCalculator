import Select from "@/components/Select";
import { establishments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "@/components/AddEstablishmentModal/styles";

const UpdateEstablishmentModal = ({
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

  const setType = (value) => {
    setValues((prev) => ({
      ...prev,
      type: value,
    }));
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
                onPress={() => setIsUpdateModalVisible(false)}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  updateRecord();
                }}
              >
                <Text style={styles.actionText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default UpdateEstablishmentModal;
