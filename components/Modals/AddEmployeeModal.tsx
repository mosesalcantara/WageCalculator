import ErrorMessage from "@/components/ErrorMessage";
import Label from "@/components/Label";
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
        className="rounded-[1.875rem] bg-black p-3"
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
        <View className="flex-1 items-center justify-center bg-black/40">
          <View className="w-4/5 gap-2 rounded-[0.625rem] bg-[#1E90FF] p-4">
            <View className="flex-row flex-wrap justify-between gap-1">
              <View className="w-[49%]">
                <Label name="Last Name" />

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
                <Label name="First Name" />

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
                <Label name="Middle Initial" />

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
                <Label name="Rate" />

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
                <Label name="Work Week Start" />

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
                <Label name="Work Week End" />

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
