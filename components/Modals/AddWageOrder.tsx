import Select from "@/components/FormikSelect";
import { employees } from "@/db/schema";
import { employee as validationSchema } from "@/schemas/globals";
import { Db, Employee, Establishment, Override } from "@/types/globals";
import { daysOptions, toastVisibilityTime } from "@/utils/globals";
import { and, sql } from "drizzle-orm";
import { Formik } from "formik";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";

const AddHolidayModal = () => {
  const initialValues = {
    last_name: "",
    first_name: "",
    middle_initial: "",
    rate: "",
    start_day: "Regular Holiday",
  };
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = async (
    values: Override<Employee, { id?: number; rate: string | number }>,
    { resetForm }: { resetForm: () => void },
  ) => {
    const NAs = ["na", "n/a"];

    values = {
      ...values,
      last_name: `${values.last_name}`.trim(),
      first_name: `${values.first_name}`.trim(),
      middle_initial: `${values.middle_initial}`.trim(),
      rate: Number(values.rate),
    };

    try {
      const records = await db.query.employees.findMany({
        where: (employees, { eq }) =>
          and(
            eq(
              sql`LOWER(${employees.last_name})`,
              values.last_name.toLowerCase(),
            ),
            eq(
              sql`LOWER(${employees.first_name})`,
              values.first_name.toLowerCase(),
            ),
          ),
      });

      const record = records.find((employee) => {
        const employeeMiddleInitial = employee.middle_initial.toLowerCase();
        const valuesMiddleInitial = values.middle_initial.toLowerCase();
        if (employeeMiddleInitial.length > 1) {
          return (
            NAs.includes(employeeMiddleInitial) &&
            NAs.includes(valuesMiddleInitial)
          );
        } else {
          return employeeMiddleInitial == valuesMiddleInitial;
        }
      });

      if (record) {
        Toast.show({
          type: "error",
          text1: "Employee Already Exists",
          visibilityTime: toastVisibilityTime,
        });
      } else {
        await db.insert(employees).values({
          ...values,
          rate: values.rate as number,
          establishment_id: values.establishment_id as number,
        });
        resetForm();
        setIsVisible(false);
        Toast.show({
          type: "success",
          text1: "Added Employee",
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
        <Text className="text-center font-bold text-white">Add Wage Order</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <Formik
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleSubmit,
          }) => (
            <View className="flex-1 items-center justify-center bg-black/40">
              <View className="w-4/5 rounded-[0.625rem] bg-[#1E90FF] p-4">
                <View className="flex-row flex-wrap justify-between gap-1">
                  <View className="w-[100%]">
                    <Text className="mt-1 text-white">Wage Order Type</Text>
                    <TextInput
                      className="mt-0.5 h-[2.6rem] rounded-[0.3125rem] bg-white px-2"
                      placeholder="Ex. RB-MIMAROPA-08"
                    />
                  </View>
                  <View className="w-[100%]">
                    <Text className="mt-1 text-white">Date</Text>
                    <TextInput
                      className="mt-0.5 h-[2.6rem] rounded-[0.3125rem] bg-white px-2"
                      placeholder="Enter date"
                    />
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

export default AddHolidayModal;
