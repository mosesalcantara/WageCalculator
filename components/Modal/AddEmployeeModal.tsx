import Select from "@/components/Select";
import { employees } from "@/db/schema";
import { employee as validationSchema } from "@/schemas/globals";
import { Employee, Establishment, Override } from "@/types/globals";
import { daysOptions } from "@/utils/globals";
import { Formik } from "formik";
import { Dispatch, SetStateAction, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import styles from "./styles";

type Props = {
  parent: Establishment;
  db: any;
  setMutations: Dispatch<SetStateAction<number>>;
};

const AddEmployeeModal = ({ parent, db, setMutations }: Props) => {
  const initialValues = {
    first_name: "",
    last_name: "",
    rate: 0,
    start_day: "Monday",
    end_day: "Friday",
  };
  const [isVisible, setIsVisible] = useState(false);

  const onSubmit = async (
    values: Override<Employee, { id?: number }>,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await db.insert(employees).values({
        ...values,
        first_name: `${values.first_name}`.trim(),
        last_name: `${values.last_name}`.trim(),
        establishment_id: parent.id,
      });
      setMutations((prev) => ++prev);
      resetForm();
      setIsVisible(false);
      Toast.show({
        type: "success",
        text1: "Added Employee",
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
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.addText}>Add Employee</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
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
            setFieldValue,
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
                    <Text style={styles.error}>{errors.first_name}</Text>
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
                    <Text style={styles.error}>{errors.last_name}</Text>
                  )}
                </View>

                <View>
                  <Text style={styles.label}>Rate:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Enter rate"
                    value={values.rate ? `${values.rate}` : ""}
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
                    options={daysOptions}
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
                    options={daysOptions}
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
                    onPress={() => setIsVisible(false)}
                  >
                    <Text style={styles.actionText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSubmit()}
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
