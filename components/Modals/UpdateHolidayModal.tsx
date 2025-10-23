import Select from "@/components/FormikSelect";
import { holidays } from "@/db/schema";
import { holiday as validationSchema } from "@/schemas/globals";
import { Db, Holiday } from "@/types/globals";
import { formatDateValue, toastVisibilityTime } from "@/utils/globals";
import DateTimePicker from "@react-native-community/datetimepicker";
import { eq } from "drizzle-orm";
import { Formik } from "formik";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useImmer } from "use-immer";

type Props = {
  db: Db;
  holiday: Holiday;
  refetch: () => void;
};

const UpdateHolidayModal = ({ db, holiday, refetch }: Props) => {
  const [isVisible, setIsVisible] = useImmer(false);
  const [isDateModalVisible, setIsDateModalVisible] = useImmer(false);

  const initialValues = holiday;

  const handleSubmit = async (
    values: Holiday,
    { resetForm }: { resetForm: () => void },
  ) => {
    const formattedValues = {
      ...values,
      name: values.name.trim(),
    };

    try {
      await db
        .update(holidays)
        .set(formattedValues)
        .where(eq(holidays.id, formattedValues.id));
      refetch();
      resetForm();
      setIsVisible(false);
      Toast.show({
        type: "success",
        text1: "Updated Holiday",
        visibilityTime: toastVisibilityTime,
      });
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
            setFieldValue,
            setFieldTouched,
          }) => (
            <View className="flex-1 items-center justify-center bg-black/40">
              <View className="w-4/5 rounded-[0.625rem] bg-[#1E90FF] p-4">
                <View>
                  <Text className="mt-1 font-bold text-white">Name</Text>
                  <TextInput
                    className="mt-0.5 rounded-[0.3125rem] bg-white px-2"
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
                  <Text className="mb-1 text-base font-bold text-white">
                    Date
                  </Text>
                  <TouchableOpacity
                    className="h-12 flex-row items-center justify-between rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                    onPress={() => setIsDateModalVisible(true)}
                  >
                    <Text>{values.date || "Select date"}</Text>
                    <Icon name="date-range" size={20} color="#555" />
                  </TouchableOpacity>
                  {touched.date && errors.date && (
                    <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                      {errors.date}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="mt-1 font-bold text-white">Type</Text>
                  <Select
                    name="type"
                    value={values.type}
                    options={[
                      {
                        label: "Regular Holiday",
                        value: "Regular Holiday",
                      },
                      {
                        label: "Special (Non-Working) Holiday",
                        value: "Special (Non-Working) Holiday",
                      },
                    ]}
                    placeholder="Select Type"
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                  />
                  {touched.type && errors.type && (
                    <Text className="mt-1 rounded-md bg-red-500 p-1 text-[0.75rem] text-white">
                      {errors.type}
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
                    <Text className="font-bold">Update</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {isDateModalVisible && (
                <DateTimePicker
                  value={formatDateValue(values.date)}
                  mode="date"
                  onChange={(_, value) => {
                    setFieldValue(
                      "date",
                      (value as Date).toISOString().split("T")[0],
                    );
                    setIsDateModalVisible(false);
                  }}
                />
              )}
            </View>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default UpdateHolidayModal;
