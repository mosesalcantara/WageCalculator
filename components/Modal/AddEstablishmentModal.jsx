import { establishments } from "@/db/schema";
import { Formik } from "formik";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import styles from "./styles";

const AddEstablishmentModal = ({ db, setMutations }) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().trim().required().label("Name"),
  });

  const initialValues = {
    name: "",
  };

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const onSubmit = async (values, { resetForm }) => {
    try {
      await db
        .insert(establishments)
        .values({ ...values, name: `${values.name}`.trim() });
      setMutations((prev) => ++prev);
      resetForm();
      setIsAddModalVisible(false);
      Toast.show({
        type: "success",
        text1: "Added Establishment",
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
      });
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Text style={styles.addText}>Add Establishment</Text>
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
                    <Text style={styles.error}>{errors.name}</Text>
                  )}
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
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

export default AddEstablishmentModal;
