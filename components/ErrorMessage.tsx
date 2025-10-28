import { FieldError } from "react-hook-form";
import { Text } from "react-native";

type Props = {
  error: FieldError | undefined;
};

const ErrorMessage = ({ error }: Props) => {
  return (
    <>
      {error && (
        <Text className="mt-1 rounded-md bg-red-500 p-1 font-r text-[0.75rem] text-white">
          {error.message}
        </Text>
      )}
    </>
  );
};

export default ErrorMessage;
