import ErrorMessage from "@/components/ErrorMessage";
import Select from "@/components/Select";
import { employees } from "@/db/schema";
import { employee as schema, Employee as Values } from "@/schemas/globals";
import { Db, Establishment } from "@/types/globals";
import { daysOptions, parseNumber, toastVisibilityTime } from "@/utils/globals";
import { yupResolver } from "@hookform/resolvers/yup";
import { and, sql } from "drizzle-orm";
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

type Props = { db: Db; establishment: Establishment; refetch: () => void };

const AddEmployeeModal = ({ db, establishment, refetch }: Props) => {
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
        } else return employeeMiddleInitial === valuesMiddleInitial;
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
        className="rounded bg-[#102a47] p-3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        onPress={() => setIsVisible(true)}
      >
        <Text className="text-center font-b text-white">Add Employee</Text>
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

                <ErrorMessage error={errors.start_day} />
              </View>

              <View className="w-[49%]">
                <Text className="mb-2 text-left font-b text-lg text-black">
                  Work Week End
                </Text>

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

                <ErrorMessage error={errors.end_day} />
              </View>
            </View>

            <View className="mt-6 gap-3">
              <TouchableOpacity
                className="rounded border bg-black py-3"
                onPress={handleSubmit(onSubmit)}
              >
                <Text className="text-center text-white font-b text-lg">Save</Text>
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

export default AddEmployeeModal;
