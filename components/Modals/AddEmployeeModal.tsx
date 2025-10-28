import Select from "@/components/Select";
import { employees } from "@/db/schema";
import { employee as schema, Employee as Values } from "@/schemas/globals";
import { Db, Establishment } from "@/types/globals";
import { daysOptions, toastVisibilityTime } from "@/utils/globals";
import { yupResolver } from "@hookform/resolvers/yup";
import { and, sql } from "drizzle-orm";
import { Controller, useForm } from "react-hook-form";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useImmer } from "use-immer";

type Props = {
  db: Db;
  establishment: Establishment;
  refetch: () => void;
};

const AddEmployeeModal = ({ db, establishment, refetch }: Props) => {
  const [isVisible, setIsVisible] = useImmer(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (values: Values) => {
    const NAs = ["na", "n/a"];

    const formattedValues = {
      ...values,
      last_name: `${values.last_name}`.trim(),
      first_name: `${values.first_name}`.trim(),
      middle_initial: `${values.middle_initial}`.trim(),
      rate: Number(values.rate),
      establishment_id: establishment.id,
    };

    try {
      const records = await db.query.employees.findMany({
        where: (employees, { eq }) =>
          and(
            eq(
              sql`LOWER(${employees.last_name})`,
              formattedValues.last_name.toLowerCase(),
            ),
            eq(
              sql`LOWER(${employees.first_name})`,
              formattedValues.first_name.toLowerCase(),
            ),
            eq(employees.establishment_id, establishment.id),
          ),
      });

      const record = records.find((employee) => {
        const employeeMiddleInitial = employee.middle_initial.toLowerCase();
        const valuesMiddleInitial =
          formattedValues.middle_initial.toLowerCase();
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
        await db.insert(employees).values(formattedValues);
        refetch();
        reset();
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
        <Text className="font-b text-center text-white">Add Employee</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="w-4/5 rounded-[0.625rem] bg-[#1E90FF] p-4">
            <View className="flex-row flex-wrap justify-between gap-1">
              <View className="w-[49%]">
                <Text className="font-b mt-1 text-white">Last Name</Text>

                <Controller
                  control={control}
                  name="last_name"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TextInput
                        className="font-r mt-0.5 rounded-[0.3125rem] bg-white px-2"
                        placeholder="Enter last name"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </>
                  )}
                />

                {errors.last_name && (
                  <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                    {errors.last_name.message}
                  </Text>
                )}
              </View>

              <View className="w-[49%]">
                <Text className="font-b mt-1 text-white">First Name</Text>

                <Controller
                  control={control}
                  name="first_name"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TextInput
                        className="font-r mt-0.5 rounded-[0.3125rem] bg-white px-2"
                        placeholder="Enter first name"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </>
                  )}
                />

                {errors.first_name && (
                  <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                    {errors.first_name.message}
                  </Text>
                )}
              </View>
            </View>

            <View className="flex-row flex-wrap justify-between gap-1">
              <View className="w-[49%]">
                <Text className="font-b mt-1 text-white">Middle Initial</Text>

                <Controller
                  control={control}
                  name="middle_initial"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TextInput
                        className="font-r mt-0.5 rounded-[0.3125rem] bg-white px-2"
                        placeholder="Ex. A or N/A"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </>
                  )}
                />

                {errors.middle_initial && (
                  <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                    {errors.middle_initial.message}
                  </Text>
                )}
              </View>

              <View className="w-[49%]">
                <Text className="font-b mt-1 text-white">Rate</Text>

                <Controller
                  control={control}
                  name="rate"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TextInput
                        className="font-r mt-0.5 rounded-[0.3125rem] bg-white px-2"
                        keyboardType="numeric"
                        placeholder="Enter rate"
                        value={value ? `${value}` : ""}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </>
                  )}
                />

                {errors.rate && (
                  <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                    {errors.rate.message}
                  </Text>
                )}
              </View>
            </View>

            <View className="flex-row flex-wrap justify-between gap-1">
              <View className="w-[49%]">
                <Text className="font-b mt-1 text-white">Work Week Start</Text>

                <Controller
                  control={control}
                  name="start_day"
                  defaultValue="Monday"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <Select
                        value={value}
                        options={daysOptions}
                        placeholder="Select Day"
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    </>
                  )}
                />

                {errors.start_day && (
                  <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                    {errors.start_day.message}
                  </Text>
                )}
              </View>

              <View className="w-[49%]">
                <Text className="font-b mt-1 text-white">Work Week End</Text>

                <Controller
                  control={control}
                  name="end_day"
                  defaultValue="Friday"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <Select
                        value={value}
                        options={daysOptions}
                        placeholder="Select Day"
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    </>
                  )}
                />

                {errors.end_day && (
                  <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                    {errors.end_day.message}
                  </Text>
                )}
              </View>
            </View>

            <View className="flex-row justify-end">
              <TouchableOpacity
                className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={() => setIsVisible(false)}
              >
                <Text className="font-b">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={handleSubmit(onSubmit)}
              >
                <Text className="font-b">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AddEmployeeModal;
