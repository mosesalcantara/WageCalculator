import { establishments } from "@/db/schema";
import { establishment as validationSchema } from "@/schemas/globals";
import { Establishment } from "@/types/globals";
import { eq } from "drizzle-orm";
import { Formik } from "formik";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  db: any;
  values: Establishment;
  refetch: () => void;
};

const UpdateEstablishmentModal = ({ db, values, refetch }: Props) => {
  const initialValues = values;
  const [isVisible, setIsVisible] = useState(false);

  const onSubmit = async (
    values: Establishment,
    { resetForm }: { resetForm: () => void },
  ) => {
    try {
      await db
        .update(establishments)
        .set({ ...values, name: `${values.name}`.trim() })
        .where(eq(establishments.id, values.id));
      refetch();
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
          }) => (
            <View className="flex-1 items-center justify-center bg-[rgba(0,0,0,0.4)]">
              <View className="w-4/5 rounded-[0.625rem] bg-[#1E90FF] p-4">
                <View>
                  <Text className="mt-1 text-white">Name:</Text>
                  <TextInput
                    className="mt-0.5 h-[2.6rem] rounded-[0.3125rem] bg-white px-2"
                    placeholder="Enter name"
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={() => setFieldTouched("name")}
                  />
                  {touched.name && errors.name && (
                    <Text className="text-[0.75rem] text-red-500">
                      {errors.name}
                    </Text>
                  )}
                </View>

                <View className="flex-row justify-end">
                  <TouchableOpacity
                    className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                    onPress={() => setIsVisible(false)}
                  >
                    <Text className="font-bold">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                    onPress={() => handleSubmit()}
                  >
                    <Text className="font-bold">Update</Text>
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
