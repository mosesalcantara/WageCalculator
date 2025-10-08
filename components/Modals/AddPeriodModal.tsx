import { period as validationSchema } from "@/schemas/globals";
import { formatDateValue } from "@/utils/globals";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Formik, FormikErrors } from "formik";
import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  onSubmit: (
    values: {
      start_date: string;
      end_date: string;
    },
    {
      resetForm,
    }: {
      resetForm: () => void;
    },
  ) => Promise<void>;
};

const AddPeriodModal = ({ onSubmit }: Props) => {
  const [isStartDateModalVisible, setIsStartDateModalVisible] = useState(false);
  const [isEndDateModalVisible, setIsEndDateModalVisible] = useState(false);

  const initialValues = {
    start_date: "",
    end_date: "",
  };
  const [isVisible, setIsVisible] = useState(false);

  const handleDateChange = (
    key: string,
    value: Date | undefined,
    setFieldValue: (
      field: string,
      value: any,
      shouldValidate?: boolean | undefined,
    ) => Promise<void | FormikErrors<{
      start_date: string;
      end_date: string;
    }>>,
  ) => {
    setFieldValue(key, (value as Date).toISOString().split("T")[0]);

    if (key == "start_date") {
      setIsStartDateModalVisible(false);
    } else if (key == "end_date") {
      setIsEndDateModalVisible(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        className="mb-10 mt-5 rounded-[1.875rem] bg-black p-3"
        onPress={() => setIsVisible(true)}
      >
        <Text className="text-center font-bold text-white">Add Period</Text>
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
          onSubmit={(
            values: { start_date: string; end_date: string },
            { resetForm }: { resetForm: () => void },
          ) => {
            onSubmit(values, { resetForm });
            // setIsVisible(false);
          }}
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
            <View className="flex-1 items-center justify-center bg-[rgba(0,0,0,0.4)]">
              <View className="w-4/5 rounded-[0.625rem] bg-[#1E90FF] p-4">
                <View className="flex-row flex-wrap justify-between gap-1">
                  <View className="w-[49%]">
                    <Text className="mb-1 text-base font-bold text-white">
                      Start Date
                    </Text>
                    <TouchableOpacity
                      className="h-11 flex-row items-center justify-between rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                      onPress={() => setIsStartDateModalVisible(true)}
                    >
                      <Text>{values.start_date || "Select start date"}</Text>
                      <Icon name="date-range" size={20} color="#555" />
                    </TouchableOpacity>
                    {touched.start_date && errors.start_date && (
                      <Text className="text-[0.75rem] text-red-500">
                        {errors.start_date}
                      </Text>
                    )}
                  </View>

                  <View className="w-[49%]">
                    <Text className="mb-1 text-base font-bold text-white">
                      End Date
                    </Text>
                    <TouchableOpacity
                      className="h-11 flex-row items-center justify-between rounded-md border border-[#ccc] bg-[#fafafa] px-2.5"
                      onPress={() => setIsEndDateModalVisible(true)}
                    >
                      <Text>{values.end_date || "Select end date"}</Text>
                      <Icon name="date-range" size={20} color="#555" />
                    </TouchableOpacity>
                    {touched.end_date && errors.end_date && (
                      <Text className="text-[0.75rem] text-red-500">
                        {errors.end_date}
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
                    <Text className="font-bold">Add</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {isStartDateModalVisible && (
                <DateTimePicker
                  value={formatDateValue(values.start_date)}
                  mode="date"
                  onChange={(_, value) => {
                    handleDateChange("start_date", value, setFieldValue);
                  }}
                />
              )}

              {isEndDateModalVisible && (
                <DateTimePicker
                  value={formatDateValue(values.end_date)}
                  mode="date"
                  onChange={(_, value) => {
                    handleDateChange("end_date", value, setFieldValue);
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

export default AddPeriodModal;
