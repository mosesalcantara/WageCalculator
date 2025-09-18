import { establishments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Formik } from "formik";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Yup from "yup";
import styles from "./styles";

const UpdateEstablishmentModal = ({ db, setMutations, values }) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().trim().required().label("Name"),
  });

  const initialValues = values;
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

  const onSubmit = async (values, { resetForm }) => {
    try {
      await db
        .update(establishments)
        .set({ ...values, name: `${values.name}`.trim() })
        .where(eq(establishments.id, values.id));
      setMutations((prev) => ++prev);
      resetForm();
      setIsUpdateModalVisible(false);
      Toast.show({
        type: "success",
        text1: "Updated Establishment",
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
                    <Text style={styles.eror}>{errors.name}</Text>
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

export default UpdateEstablishmentModal;
