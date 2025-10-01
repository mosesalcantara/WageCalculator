import Select from "@/components/Select";
import { employees } from "@/db/schema";
import { employee as validationSchema } from "@/schemas/globals";
import { Employee } from "@/types/globals";
import { daysOptions } from "@/utils/globals";
import { eq } from "drizzle-orm";
import { Formik } from "formik";
import { Dispatch, SetStateAction, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import tw from "twrnc";

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
      refetch()
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
            <View
              style={tw`flex-1 bg-[rgba(0,0,0,0.4)] justify-center items-center`}
            >
              <View style={tw`bg-[#1E90FF] p-4 rounded-[0.625rem] w-4/5 `}>
                <View>
                  <Text style={tw`text-white mt-2.5`}>First Name:</Text>
                  <TextInput
                    style={tw`bg-white rounded-[0.3125rem] px-2 h-[2.1875rem] mt-0.5`}
                    placeholder="Enter first name"
                    value={values.first_name}
                    onChangeText={handleChange("first_name")}
                    onBlur={() => setFieldTouched("first_name")}
                  />
                  {touched.first_name && errors.first_name && (
                    <Text style={tw`text-red-500 text-[0.75rem]`}>
                      {errors.first_name}
                    </Text>
                  )}
                </View>

                <View>
                  <Text style={tw`text-white mt-2.5`}>Last Name:</Text>
                  <TextInput
                    style={tw`bg-white rounded-[0.3125rem] px-2 h-[2.1875rem] mt-0.5`}
                    placeholder="Enter last name"
                    value={values.last_name}
                    onChangeText={handleChange("last_name")}
                    onBlur={() => setFieldTouched("last_name")}
                  />
                  {touched.last_name && errors.last_name && (
                    <Text style={tw`text-red-500 text-[0.75rem]`}>
                      {errors.last_name}
                    </Text>
                  )}
                </View>

                <View>
                  <Text style={tw`text-white mt-2.5`}>Rate:</Text>
                  <TextInput
                    style={tw`bg-white rounded-[0.3125rem] px-2 h-[2.1875rem] mt-0.5`}
                    keyboardType="numeric"
                    placeholder="Enter rate"
                    value={values.rate ? `${values.rate}` : ""}
                    onChangeText={handleChange("rate")}
                    onBlur={() => setFieldTouched("rate")}
                  />
                  {touched.rate && errors.rate && (
                    <Text style={tw`text-red-500 text-[0.75rem]`}>
                      {errors.rate}
                    </Text>
                  )}
                </View>

                <View>
                  <Text style={tw`text-white mt-2.5`}>Work Week Start:</Text>
                  <Select
                    name="start_day"
                    options={daysOptions}
                    placeholder="Select Day"
                    value={values.start_day}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                  />
                  {touched.start_day && errors.start_day && (
                    <Text style={tw`text-red-500 text-[0.75rem]`}>
                      {errors.start_day}
                    </Text>
                  )}
                </View>

                <View>
                  <Text style={tw`text-white mt-2.5`}>Work Week End:</Text>
                  <Select
                    name="end_day"
                    options={daysOptions}
                    placeholder="Select Day"
                    value={values.end_day}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                  />
                  {touched.end_day && errors.end_day && (
                    <Text style={tw`text-red-500 text-[0.75rem]`}>
                      {errors.end_day}
                    </Text>
                  )}
                </View>

                <View style={tw`flex-row justify-end`}>
                  <TouchableOpacity
                    style={tw`bg-white py-[0.3125rem] px-2.5 rounded mt-2.5 mr-2`}
                    onPress={() => setIsVisible(false)}
                  >
                    <Text style={tw`font-bold`}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`bg-white py-[0.3125rem] px-2.5 rounded mt-2.5 mr-2`}
                    onPress={() => handleSubmit()}
                  >
                    <Text style={tw`font-bold`}>Update</Text>
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
