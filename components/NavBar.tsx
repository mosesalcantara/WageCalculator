import { Image, Text, View } from "react-native";

type Props = { title?: string; className?: string };

const NavBar = ({ title = "DOLECalc", className = "" }: Props) => {
  return (
    <View
      className={`h-[3.75rem] flex-row items-center justify-between border-b bg-primary px-2.5 ${className}`}
    >
      <Image
        source={require("@/assets/images/dole.png")}
        className="h-[3.75rem] w-[3.75rem]"
        style={{ resizeMode: "contain" }}
      />

      <View>
        <Text className="text-center font-b text-xl">{title}</Text>
        <Text className="text-center font-sb text-sm">as of 12-19-2025</Text>
      </View>

      <Image
        source={require("@/assets/images/bagongpilipinas.png")}
        className="h-[3.75rem] w-[3.75rem]"
        style={{ resizeMode: "contain" }}
      />
    </View>
  );
};

export default NavBar;
