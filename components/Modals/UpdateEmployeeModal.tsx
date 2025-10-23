import Select from "@/components/FormikSelect";
import { employees } from "@/db/schema";
import { employee as validationSchema } from "@/schemas/globals";
import { Db, Employee, Establishment } from "@/types/globals";
import { daysOptions, toastVisibilityTime } from "@/utils/globals";
import { and, eq, sql } from "drizzle-orm";
import { Formik } from "formik";
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
  const initialValues = employee;
  const [isVisible, setIsVisible] = useImmer(false);

  const handleSubmit = async (
    values: Employee,
    { resetForm }: { resetForm: () => void },
  ) => {
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
              values.last_name.toLowerCase(),
            ),
            eq(
              sql`LOWER(${employees.first_name})`,
              values.first_name.toLowerCase(),
            ),
            eq(employees.establishment_id, establishment.id),
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

      const isSame =
        employee.last_name.toLowerCase() == values.last_name.toLowerCase() &&
        employee.first_name.toLowerCase() == values.first_name.toLowerCase() &&
        (employee.middle_initial.length > 1
          ? NAs.includes(employee.middle_initial.toLowerCase()) &&
            NAs.includes(values.middle_initial.toLowerCase())
          : employee.middle_initial.toLowerCase() ==
            values.middle_initial.toLowerCase());

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
          .where(eq(employees.id, values.id));
        refetch();
        resetForm();
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
                <View className="flex-row flex-wrap justify-between gap-1">
                  <View className="w-[49%]">
                    <Text className="mt-1 font-bold text-white">Last Name</Text>
                    <TextInput
                      className="mt-0.5 rounded-[0.3125rem] bg-white px-2"
                      placeholder="Enter last name"
                      value={values.last_name}
                      onChangeText={handleChange("last_name")}
                      onBlur={() => setFieldTouched("last_name")}
                    />
                    {touched.last_name && errors.last_name && (
                      <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                        {errors.last_name}
                      </Text>
                    )}
                  </View>

                  <View className="w-[49%]">
                    <Text className="mt-1 font-bold text-white">
                      First Name
                    </Text>
                    <TextInput
                      className="mt-0.5 rounded-[0.3125rem] bg-white px-2"
                      placeholder="Enter first name"
                      value={values.first_name}
                      onChangeText={handleChange("first_name")}
                      onBlur={() => setFieldTouched("first_name")}
                    />
                    {touched.first_name && errors.first_name && (
                      <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                        {errors.first_name}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex-row flex-wrap justify-between gap-1">
                  <View className="w-[49%]">
                    <Text className="mt-1 font-bold text-white">
                      Middle Initial
                    </Text>
                    <TextInput
                      className="mt-0.5 rounded-[0.3125rem] bg-white px-2"
                      placeholder="Enter initial"
                      value={values.middle_initial}
                      onChangeText={handleChange("middle_initial")}
                      onBlur={() => setFieldTouched("middle_initial")}
                    />
                    {touched.middle_initial && errors.middle_initial && (
                      <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                        {errors.middle_initial}
                      </Text>
                    )}
                  </View>

                  <View className="w-[49%]">
                    <Text className="mt-1 font-bold text-white">Rate</Text>
                    <TextInput
                      className="mt-0.5 rounded-[0.3125rem] bg-white px-2"
                      keyboardType="numeric"
                      placeholder="Enter rate"
                      value={`${values.rate}`}
                      onChangeText={handleChange("rate")}
                      onBlur={() => setFieldTouched("rate")}
                    />
                    {touched.rate && errors.rate && (
                      <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                        {errors.rate}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex-row flex-wrap justify-between gap-1">
                  <View className="w-[49%]">
                    <Text className="mt-1 font-bold text-white">
                      Work Week Start
                    </Text>
                    <Select
                      name="start_day"
                      value={values.start_day}
                      options={daysOptions}
                      placeholder="Select Day"
                      setFieldValue={setFieldValue}
                      setFieldTouched={setFieldTouched}
                    />
                    {touched.start_day && errors.start_day && (
                      <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                        {errors.start_day}
                      </Text>
                    )}
                  </View>

                  <View className="w-[49%]">
                    <Text className="mt-1 font-bold text-white">
                      Work Week End
                    </Text>
                    <Select
                      name="end_day"
                      value={values.end_day}
                      options={daysOptions}
                      placeholder="Select Day"
                      setFieldValue={setFieldValue}
                      setFieldTouched={setFieldTouched}
                    />
                    {touched.end_day && errors.end_day && (
                      <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
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
