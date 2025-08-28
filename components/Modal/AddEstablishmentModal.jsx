import { establishments } from "@/db/schema";
import { Formik } from "formik";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import * as Yup from "yup";
import styles from "./styles";

const AddEstablishmentModal = ({ db, setMutations }) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().trim().required().label("Name"),
    type: Yup.string().trim().required().label("Type"),
    address: Yup.string().trim().required().label("Address"),
  });

  const initialValues = {
    name: "",
    type: "Non-Agriculture",
    address: "",
  };

  const [isFocus, setIsFocus] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const onSubmit = async (values, { resetForm }) => {
    try {
      await db.insert(establishments).values(values);
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
                    <Text style={{ color: "red", fontSize: 12 }}>
                      {errors.name}
                    </Text>
                  )}
                </View>

                <View>
                  <Text style={styles.label}>Type:</Text>
                  <View
                    style={{
                      backgroundColor: "white",
                      padding: 7,
                      marginTop: 3,
                      borderRadius: 5,
                    }}
                  >
                    <Dropdown
                      style={[
                        {
                          height: 27,
                        },
                        isFocus && { borderColor: "blue" },
                      ]}
                      placeholderStyle={{
                        fontSize: 14,
                      }}
                      selectedTextStyle={{
                        fontSize: 14,
                      }}
                      data={[
                        { label: "Agriculture", value: "Agriculture" },
                        { label: "Non-Agriculture", value: "Non-Agriculture" },
                      ]}
                      labelField="label"
                      valueField="value"
                      placeholder={!isFocus ? "Select type" : ""}
                      value={values.type}
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={(option) => {
                        setFieldValue("type", option.value);
                        setIsFocus(false);
                      }}
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.label}>Address:</Text>
                  <TextInput
                    style={{...styles.input, textAlignVertical: "top"}}
                    multiline
                    placeholder="Enter address"
                    value={values.address}
                    onChangeText={handleChange("address")}
                    onBlur={() => setFieldTouched("address")}
                  />
                  {touched.address && errors.address && (
                    <Text style={{ color: "red", fontSize: 12 }}>
                      {errors.address}
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

export default AddEstablishmentModal;
