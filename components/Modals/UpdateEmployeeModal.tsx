import Select from "@/components/RHFSelect";
import { employees } from "@/db/schema";
import { employee as schema, Employee as Values } from "@/schemas/globals";
import { Db, Employee, Establishment } from "@/types/globals";
import { daysOptions, toastVisibilityTime } from "@/utils/globals";
import { yupResolver } from "@hookform/resolvers/yup";
import { and, eq, sql } from "drizzle-orm";
import { Controller, useForm } from "react-hook-form";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useImmer } from "use-immer";

type Props = {
  db: Db;
  establishment: Establishment;
  employee: Employee;
  refetch: () => void;
};

const UpdateEmployeeModal = ({
  db,
  establishment,
  employee,
  refetch,
}: Props) => {
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

      const isSame =
        employee.last_name.toLowerCase() ==
          formattedValues.last_name.toLowerCase() &&
        employee.first_name.toLowerCase() ==
          formattedValues.first_name.toLowerCase() &&
        (employee.middle_initial.length > 1
          ? NAs.includes(employee.middle_initial.toLowerCase()) &&
            NAs.includes(formattedValues.middle_initial.toLowerCase())
          : employee.middle_initial.toLowerCase() ==
            formattedValues.middle_initial.toLowerCase());

      if (record && !isSame) {
        Toast.show({
          type: "error",
          text1: "Employee Already Exists",
          visibilityTime: toastVisibilityTime,
        });
      } else {
        await db
          .update(employees)
          .set(formattedValues)
          .where(eq(employees.id, employee.id));
        refetch();
        reset();
        setIsVisible(false);
        Toast.show({
          type: "success",
          text1: "Updated Employee",
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
      <TouchableOpacity onPress={() => setIsVisible(true)}>
        <Icon name="edit" size={20} color="#2196F3" />
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
                <Text className="mt-1 font-bold text-white">Last Name</Text>

                <Controller
                  control={control}
                  name="last_name"
                  defaultValue={employee.last_name}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TextInput
                        className="mt-0.5 rounded-[0.3125rem] bg-white px-2"
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
                <Text className="mt-1 font-bold text-white">First Name</Text>

                <Controller
                  control={control}
                  name="first_name"
                  defaultValue={employee.first_name}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TextInput
                        className="mt-0.5 rounded-[0.3125rem] bg-white px-2"
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
                <Text className="mt-1 font-bold text-white">
                  Middle Initial
                </Text>

                <Controller
                  control={control}
                  name="middle_initial"
                  defaultValue={employee.middle_initial}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TextInput
                        className="mt-0.5 rounded-[0.3125rem] bg-white px-2"
                        placeholder="Enter middle initial"
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
                <Text className="mt-1 font-bold text-white">Rate</Text>

                <Controller
                  control={control}
                  name="rate"
                  defaultValue={employee.rate}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TextInput
                        className="mt-0.5 rounded-[0.3125rem] bg-white px-2"
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
                <Text className="mt-1 font-bold text-white">
                  Work Week Start
                </Text>

                <Controller
                  control={control}
                  name="start_day"
                  defaultValue={employee.start_day}
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
                <Text className="mt-1 font-bold text-white">Work Week End</Text>

                <Controller
                  control={control}
                  name="end_day"
                  defaultValue={employee.end_day}
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
                <Text className="font-bold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mr-2 mt-2.5 rounded bg-white px-2.5 py-[0.3125rem]"
                onPress={handleSubmit(onSubmit)}
              >
                <Text className="font-bold">Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default UpdateEmployeeModal;
