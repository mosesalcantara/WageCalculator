import styles from "./styles";
import { employees } from "@/db/schema";
import { Formik } from "formik";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Yup from "yup";

const AddEmployeeModal = ({ db, setMutations, parent }) => {
  const validationSchema = Yup.object().shape({
    first_name: Yup.string().trim().required().label("First Name"),
    last_name: Yup.string().trim().required().label("Last Name"),
    rate: Yup.number().typeError().required().label("Rate"),
  });

  const initialValues = {
    first_name: "",
    last_name: "",
    rate: "",
  };
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const onSubmit = async (values, { resetForm }) => {
    try {
      await db
        .insert(employees)
        .values({ ...values, establishment_id: parent.id });
      setMutations((prev) => ++prev);
      resetForm();
      setIsAddModalVisible(false);
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
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleSubmit,
            handleChange,
            setFieldTouched,
          }) => (
            <View style={styles.modalOverlay}>
              <View style={styles.form}>
                <View>
                  <Text style={styles.label}>First Name:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter first name"
                    value={values.first_name}
                    onChangeText={handleChange("first_name")}
                    onBlur={() => setFieldTouched("first_name")}
                  />
                  {touched.first_name && errors.first_name && (
                    <Text style={{ color: "red", fontSize: 12 }}>
                      {errors.first_name}
                    </Text>
                  )}
                </View>

                <View>
                  <Text style={styles.label}>Last Name:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter last name"
                    value={values.last_name}
                    onChangeText={handleChange("last_name")}
                    onBlur={() => setFieldTouched("last_name")}
                  />
                  {touched.last_name && errors.last_name && (
                    <Text style={{ color: "red", fontSize: 12 }}>
                      {errors.last_name}
                    </Text>
                  )}
                </View>

                <View>
                  <Text style={styles.label}>Rate:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Enter rate"
                    value={values.rate}
                    onChangeText={handleChange("rate")}
                    onBlur={() => setFieldTouched("rate")}
                  />
                  {touched.rate && errors.rate && (
                    <Text style={{ color: "red", fontSize: 12 }}>
                      {errors.rate}
                    </Text>
                  )}
                </View>

                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <TouchableOpacity
                    style={[styles.actionButton, { marginRight: 8 }]}
                    onPress={() => setIsAddModalVisible(false)}
                  >
                    <Text style={styles.actionText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.actionText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default AddEmployeeModal;
