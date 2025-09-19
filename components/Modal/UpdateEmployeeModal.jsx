import Select from "@/components/Select";
import { employees } from "@/db/schema";
import { employee as validationSchema } from "@/schema/schema";
import { days } from "@/utils/utils";
import { eq } from "drizzle-orm";
import { Formik } from "formik";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./styles";

const UpdateEmployeeModal = ({ db, setMutations, values }) => {
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
      Toast.show({
        type: "success",
        text1: "Updated Employee",
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

                <View>
                  <Text style={styles.label}>Work Week Start:</Text>
                  <Select
                    name="start_day"
                    options={days}
                    placeholder="Select Day"
                    value={values.start_day}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                  />
                  {touched.start_day && errors.start_day && (
                    <Text style={styles.error}>{errors.start_day}</Text>
                  )}
                </View>

                <View>
                  <Text style={styles.label}>Work Week End:</Text>
                  <Select
                    name="end_day"
                    options={days}
                    placeholder="Select Day"
                    value={values.end_day}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                  />
                  {touched.end_day && errors.end_day && (
                    <Text style={styles.error}>{errors.end_day}</Text>
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
