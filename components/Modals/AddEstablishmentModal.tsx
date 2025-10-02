import { establishments } from "@/db/schema";
import { establishment as validationSchema } from "@/schemas/globals";
import { Establishment, Override } from "@/types/globals";
import { Formik } from "formik";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type Props = {
  db: any;
  refetch: () => void;
};

const AddEstablishmentModal = ({ db, refetch }: Props) => {
  const initialValues = {
    name: "",
  };

  const [isVisible, setIsVisible] = useState(false);

  const onSubmit = async (
    values: Override<Establishment, { id?: number }>,
    { resetForm }: { resetForm: () => void },
  ) => {
    try {
      await db
        .insert(establishments)
        .values({ ...values, name: `${values.name}`.trim() });
      refetch();
      resetForm();
      setIsVisible(false);
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
        className="mb-10 mt-5 rounded-[1.875rem] bg-black p-3"
        onPress={() => setIsVisible(true)}
      >
        <Text className="text-center font-bold text-white">
          Add Establishment
        </Text>
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
                  <Text className="mt-2.5 text-white">Name:</Text>
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
                    <Text className="font-bold">Save</Text>
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
