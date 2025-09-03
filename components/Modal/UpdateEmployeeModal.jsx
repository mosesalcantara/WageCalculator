import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Formik } from "formik";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Yup from "yup";
import styles from "./styles";

const UpdateEmployeeModal = ({ db, setMutations, values }) => {
  const validationSchema = Yup.object().shape({
    first_name: Yup.string().trim().required().label("First Name"),
    last_name: Yup.string().trim().required().label("Last Name"),
    rate: Yup.number().typeError().required().label("Rate"),
  });

  const initialValues = values;
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

  const onSubmit = async (values, { resetForm }) => {
    try {
      await db
        .update(employees)
        .set({
          ...values,
          first_name: `${values.first_name}`.trim(),
          last_name: `${values.last_name}`.trim(),
        })
        .where(eq(employees.id, values.id));
      setMutations((prev) => ++prev);
      resetForm();
      setIsUpdateModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "An Error Eccurred");
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setIsUpdateModalVisible(true);
        }}
      >
        <Icon name="edit" size={20} color="#2196F3" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={isUpdateModalVisible}
        onRequestClose={() => setIsUpdateModalVisible(false)}
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
                    <Text style={styles.eror}>{errors.first_name}</Text>
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
                    <Text style={styles.eror}>{errors.last_name}</Text>
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
                    <Text style={styles.error}>{errors.rate}</Text>
                  )}
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setIsUpdateModalVisible(false)}
                  >
                    <Text style={styles.actionText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.actionText}>Update</Text>
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

export default UpdateEmployeeModal;
