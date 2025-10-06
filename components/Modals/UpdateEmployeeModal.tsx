import Select from "@/components/Select";
import { employees } from "@/db/schema";
import { employee as validationSchema } from "@/schemas/globals";
import { Employee } from "@/types/globals";
import { daysOptions } from "@/utils/globals";
import { eq } from "drizzle-orm";
import { Formik } from "formik";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  db: any;
  values: Employee;
  refetch: () => void;
};

const UpdateEmployeeModal = ({ db, values, refetch }: Props) => {
  const initialValues = values;
  const [isVisible, setIsVisible] = useState(false);

  const onSubmit = async (
    values: Employee,
    { resetForm }: { resetForm: () => void },
  ) => {
    try {
      await db
        .update(employees)
        .set({
          ...values,
          first_name: `${values.first_name}`.trim(),
          last_name: `${values.last_name}`.trim(),
        })
        .where(eq(employees.id, values.id));
      refetch();
      resetForm();
      setIsVisible(false);
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
            <View className="flex-1 items-center justify-center bg-[rgba(0,0,0,0.4)]">
              <View className="w-4/5 rounded-[0.625rem] bg-[#1E90FF] p-4">
                <View className="flex-row flex-wrap justify-between gap-1">
                  <View className="w-[49%]">
                    <Text className="mt-1 text-white">Last Name:</Text>
                    <TextInput
                      className="mt-0.5 h-[2.6rem] rounded-[0.3125rem] bg-white px-2"
                      placeholder="Enter last name"
                      value={values.last_name}
                      onChangeText={handleChange("last_name")}
                      onBlur={() => setFieldTouched("last_name")}
                    />
                    {touched.last_name && errors.last_name && (
                      <Text className="text-[0.75rem] text-red-500">
                        {errors.last_name}
                      </Text>
                    )}
                  </View>

                  <View className="w-[49%]">
                    <Text className="mt-1 text-white">First Name:</Text>
                    <TextInput
                      className="mt-0.5 h-[2.6rem] rounded-[0.3125rem] bg-white px-2"
                      placeholder="Enter first name"
                      value={values.first_name}
                      onChangeText={handleChange("first_name")}
                      onBlur={() => setFieldTouched("first_name")}
                    />
                    {touched.first_name && errors.first_name && (
                      <Text className="text-[0.75rem] text-red-500">
                        {errors.first_name}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex-row flex-wrap justify-between gap-1">
                  <View className="w-[49%]">
                    <Text className="mt-1 text-white">Middle Name:</Text>
                    <TextInput
                      className="mt-0.5 h-[2.6rem] rounded-[0.3125rem] bg-white px-2"
                      placeholder="Enter middle name"
                      value={values.middle_name}
                      onChangeText={handleChange("middle_name")}
                      onBlur={() => setFieldTouched("middle_name")}
                    />
                    {touched.middle_name && errors.middle_name && (
                      <Text className="text-[0.75rem] text-red-500">
                        {errors.middle_name}
                      </Text>
                    )}
                  </View>

                  <View className="w-[49%]">
                    <Text className="mt-1 text-white">Rate:</Text>
                    <TextInput
                      className="mt-0.5 h-[2.6rem] rounded-[0.3125rem] bg-white px-2"
                      keyboardType="numeric"
                      placeholder="Enter rate"
                      value={values.rate ? `${values.rate}` : ""}
                      onChangeText={handleChange("rate")}
                      onBlur={() => setFieldTouched("rate")}
                    />
                    {touched.rate && errors.rate && (
                      <Text className="text-[0.75rem] text-red-500">
                        {errors.rate}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex-row flex-wrap justify-between gap-1">
                  <View className="w-[49%]">
                    <Text className="mt-1 text-white">Work Week Start:</Text>
                    <Select
                      name="start_day"
                      options={daysOptions}
                      placeholder="Select Day"
                      value={values.start_day}
                      setFieldValue={setFieldValue}
                      setFieldTouched={setFieldTouched}
                    />
                    {touched.start_day && errors.start_day && (
                      <Text className="text-[0.75rem] text-red-500">
                        {errors.start_day}
                      </Text>
                    )}
                  </View>

                  <View className="w-[49%]">
                    <Text className="mt-1 text-white">Work Week End:</Text>
                    <Select
                      name="end_day"
                      options={daysOptions}
                      placeholder="Select Day"
                      value={values.end_day}
                      setFieldValue={setFieldValue}
                      setFieldTouched={setFieldTouched}
                    />
                    {touched.end_day && errors.end_day && (
                      <Text className="text-[0.75rem] text-red-500">
                        {errors.end_day}
                      </Text>
                    )}
                  </View>
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

export default UpdateEmployeeModal;
