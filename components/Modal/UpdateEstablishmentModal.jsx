import { establishments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Formik } from "formik";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import * as Yup from "yup";
import styles from "./styles";

const UpdateEstablishmentModal = ({
  db,
  setMutations,
  values,
  isUpdateModalVisibleState,
}) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().trim().required().label("Name"),
  });

  const initialValues = values;

  const [isUpdateModalVisible, setIsUpdateModalVisible] =
    isUpdateModalVisibleState;

  const onSubmit = async (values, { resetForm }) => {
    try {
      await db
        .update(establishments)
        .set(values)
        .where(eq(establishments.id, values.id));
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
            setFieldValue,
          }) => (
            <View style={styles.modalOverlay}>
              <View style={styles.form}>
                <View>
                  <Text style={styles.label}>Name:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter name"
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={() => setFieldTouched("name")}
                  />
                  {touched.name && errors.name && (
                    <Text style={{ color: "red", fontSize: 12 }}>
                      {errors.name}
                    </Text>
                  )}
                </View>

                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <TouchableOpacity
                    style={[styles.actionButton, { marginRight: 8 }]}
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

export default UpdateEstablishmentModal;
