import { establishments } from "@/db/schema";
import { establishment as validationSchema } from "@/schemas/globals";
import { Establishment } from "@/types/globals";
import { eq } from "drizzle-orm";
import { Formik } from "formik";
import { Dispatch, SetStateAction, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "./styles";

type Props = {
  db: any;
  setMutations: Dispatch<SetStateAction<number>>;
  values: Establishment;
};

const UpdateEstablishmentModal = ({ db, setMutations, values }: Props) => {
  const initialValues = values;
  const [isVisible, setIsVisible] = useState(false);

  const onSubmit = async (
    values: Establishment,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      await db
        .update(establishments)
        .set({ ...values, name: `${values.name}`.trim() })
        .where(eq(establishments.id, values.id));
      setMutations((prev) => ++prev);
      resetForm();
      setIsVisible(false);
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
      <TouchableOpacity onPress={() => setIsVisible(true)}>
        <Icon name="edit" size={20} color="#2196F3" />
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
                    onPress={() => setIsVisible(false)}
                  >
                    <Text style={styles.actionText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSubmit()}
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
