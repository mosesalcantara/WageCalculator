import Select from "@/components/FormikSelect";
import { establishments } from "@/db/schema";
import { establishment as validationSchema } from "@/schemas/globals";
import { Db, Establishment, Override } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import { eq, sql } from "drizzle-orm";
import { Formik } from "formik";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type Props = {
  db: Db;
  refetch: () => void;
};

const AddEstablishmentModal = ({ db, refetch }: Props) => {
  const initialValues = {
    name: "",
    size: "Employing 10 or more workers",
  };

  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = async (
    values: Override<Establishment, { id?: number }>,
    { resetForm }: { resetForm: () => void },
  ) => {
    values = {
      ...values,
      name: values.name.trim(),
    };

    try {
      const exists = await db.query.establishments.findFirst({
        where: eq(sql`LOWER(${establishments.name})`, values.name.toLowerCase()),
      }) ?? false;

      if (exists) {
        Toast.show({
          type: "error",
          text1: "Establishment Already Exists",
          visibilityTime: toastVisibilityTime,
        });
      } else {
        await db.insert(establishments).values(values);
        refetch();
        resetForm();
        setIsVisible(false);
        Toast.show({
          type: "success",
          text1: "Added Establishment",
          visibilityTime: toastVisibilityTime,
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
        visibilityTime: toastVisibilityTime,
      });
    }
  };

  return (
    <>
      <TouchableOpacity
        className="rounded-[1.875rem] bg-black p-3"
        onPress={() => setIsVisible(true)}
      >
        <Text className="text-center font-bold text-white">
          Add Establishment
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
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
            <View className="flex-1 items-center justify-center bg-black/40">
              <View className="w-4/5 rounded-[0.625rem] bg-[#1E90FF] p-4">
                <View>
                  <Text className="mt-1 text-white">Name</Text>
                  <TextInput
                    className="mt-0.5 h-[2.6rem] rounded-[0.3125rem] bg-white px-2"
                    placeholder="Enter name"
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={() => setFieldTouched("name")}
                  />
                  {touched.name && errors.name && (
                    <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                      {errors.name}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="mt-1 text-white">Size</Text>
                  <Select
                    name="size"
                    value={values.size}
                    options={[
                      {
                        label: "Employing 1 to 5 workers",
                        value: "Employing 1 to 5 workers",
                      },
                      {
                        label: "Employing 1 to 9 workers",
                        value: "Employing 1 to 9 workers",
                      },
                      {
                        label: "Employing 10 or more workers",
                        value: "Employing 10 or more workers",
                      },
                    ]}
                    placeholder="Select Size"
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                  />
                  {touched.size && errors.size && (
                    <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                      {errors.size}
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
