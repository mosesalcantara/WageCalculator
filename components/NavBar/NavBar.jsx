import BagongPilipinasImage from "@/assets/images/bagongpilipinas.png";
import DoleImage from "@/assets/images/dole.png";
import { Image, Text, View } from "react-native";
import { styles } from "./styles";

const NavBar = ({ title }) => {
  return (
    <View style={styles.header}>
      <Image source={DoleImage} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Image source={BagongPilipinasImage} style={styles.image} />
    </View>
  );
};

export default NavBar;
