import { establishments } from "@/db/schema";
import { establishment as validationSchema } from "@/schemas/globals";
import { Establishment, Override } from "@/types/globals";
import { Formik } from "formik";
import { Dispatch, SetStateAction, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import tw from "twrnc";

type Props = {
  db: any;
  setMutations: Dispatch<SetStateAction<number>>;
};

const AddEstablishmentModal = ({ db, setMutations }: Props) => {
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
      setMutations((prev) => ++prev);
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
        style={tw`bg-black p-3 rounded-[1.875rem] mt-5 mb-10`}
        onPress={() => setIsVisible(true)}
      >
        <Text style={tw`text-white text-center font-bold`}>
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
            <View
              style={tw`flex-1 bg-[rgba(0,0,0,0.4)] justify-center items-center`}
            >
              <View style={tw`bg-[#1E90FF] p-4 rounded-[0.625rem] w-4/5 `}>
                <View>
                  <Text style={tw`text-white mt-2.5`}>Name:</Text>
                  <TextInput
                    style={tw`bg-white rounded-[0.3125rem] px-2 h-[2.1875rem] mt-0.5`}
                    placeholder="Enter name"
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={() => setFieldTouched("name")}
                  />
                  {touched.name && errors.name && (
                    <Text style={tw`text-red-500 text-[0.75rem]`}>
                      {errors.name}
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
                    <Text style={tw`font-bold`}>Save</Text>
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
