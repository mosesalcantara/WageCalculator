import ErrorMessage from "@/components/ErrorMessage";
import Select from "@/components/Select";
import { employees } from "@/db/schema";
import { employee as schema, Employee as Values } from "@/schemas/globals";
import { Db, Employee, Establishment } from "@/types/globals";
import { daysOptions, parseNumber, toastVisibilityTime } from "@/utils/globals";
import { MaterialIcons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { and, eq, sql } from "drizzle-orm";
import { Controller, useForm } from "react-hook-form";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
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
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values: Values) => {
    const NAs = ["na", "n/a"];

    const formattedValues = {
      ...values,
      last_name: `${values.last_name}`.trim(),
      first_name: `${values.first_name}`.trim(),
      middle_initial: `${values.middle_initial}`.trim(),
      rate: parseNumber(values.rate),
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
        } else return employeeMiddleInitial === valuesMiddleInitial;
      });

      const isSame =
        employee.last_name.toLowerCase() ===
          formattedValues.last_name.toLowerCase() &&
        employee.first_name.toLowerCase() ===
          formattedValues.first_name.toLowerCase() &&
        (employee.middle_initial.length > 1
          ? NAs.includes(employee.middle_initial.toLowerCase()) &&
            NAs.includes(formattedValues.middle_initial.toLowerCase())
          : employee.middle_initial.toLowerCase() ===
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
        <MaterialIcons name="edit" size={20} color="#2196F3" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          style={{ flex: 2, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setIsVisible(false)}
        ></Pressable>

        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="absolute bottom-0.5 w-full gap-2 rounded-t-xl bg-primary px-8 py-6">
            <View className="flex-row flex-wrap justify-between gap-1">
              <View className="w-[49%]">
                <Text className="mb-2 text-left font-b text-lg text-black">
                  Last Name
                </Text>

                <Controller
                  control={control}
                  name="last_name"
                  defaultValue={employee.last_name}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TextInput
                        className="mt-0.5 rounded-[0.3125rem] bg-white px-2 font-r"
                        placeholder="Enter last name"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </>
                  )}
                />

                <ErrorMessage error={errors.last_name} />
              </View>

              <View className="w-[49%]">
                <Text className="mb-2 text-left font-b text-lg text-black">
                  First Name
                </Text>

                <Controller
                  control={control}
                  name="first_name"
                  defaultValue={employee.first_name}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TextInput
                        className="mt-0.5 rounded-[0.3125rem] bg-white px-2 font-r"
                        placeholder="Enter first name"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </>
                  )}
                />

                <ErrorMessage error={errors.first_name} />
              </View>
            </View>

            <View className="flex-row flex-wrap justify-between gap-1">
              <View className="w-[49%]">
                <Text className="mb-2 text-left font-b text-lg text-black">
                  Middle Initial
                </Text>

                <Controller
                  control={control}
                  name="middle_initial"
                  defaultValue={employee.middle_initial}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TextInput
                        className="mt-0.5 rounded-[0.3125rem] bg-white px-2 font-r"
                        placeholder="Ex. A or N/A"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </>
                  )}
                />

                <ErrorMessage error={errors.middle_initial} />
              </View>

              <View className="w-[49%]">
                <Text className="mb-2 text-left font-b text-lg text-black">
                  Rate
                </Text>

                <Controller
                  control={control}
                  name="rate"
                  defaultValue={employee.rate}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <>
                      <TextInput
                        className="mt-0.5 rounded-[0.3125rem] bg-white px-2 font-r"
                        keyboardType="numeric"
                        placeholder="Enter rate"
                        value={value ? `${value}` : ""}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </>
                  )}
                />

                <ErrorMessage error={errors.rate} />
              </View>
            </View>

            <View className="flex-row flex-wrap justify-between gap-1">
              <View className="w-[49%]">
                <Text className="mb-2 text-left font-b text-lg text-black">
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

                <ErrorMessage error={errors.start_day} />
              </View>

              <View className="w-[49%]">
                <Text className="mb-2 text-left font-b text-lg text-black">
                  Work Week End
                </Text>

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

                <ErrorMessage error={errors.end_day} />
              </View>
            </View>

            <View className="mt-6 gap-3">
              <TouchableOpacity
                className="rounded border bg-white py-3"
                onPress={handleSubmit(onSubmit)}
              >
                <Text className="text-center font-b text-lg">Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded border bg-white py-3"
                onPress={() => setIsVisible(false)}
              >
                <Text className="text-center font-b text-lg">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default UpdateEmployeeModal;
