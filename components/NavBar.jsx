import BagongPilipinasImage from "@/assets/images/bagongpilipinas.png";
import DoleImage from "@/assets/images/dole.png";
import { Image, Text, View } from "react-native";

const NavBar = ({ title = "Wage Calculator" }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        backgroundColor: "#acb6e2ff",
        height: 60,
      }}
    >
      <Image
        source={DoleImage}
        style={{
          width: 60,
          height: 60,
          resizeMode: "contain",
        }}
      />
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
          flex: 1,
        }}
      >
        {title}
      </Text>
      <Image
        source={BagongPilipinasImage}
        style={{
          width: 60,
          height: 60,
          resizeMode: "contain",
        }}
      />
    </View>
  );
};

export default NavBar;
