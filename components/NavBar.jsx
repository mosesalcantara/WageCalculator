import {View, Text, StyleSheet, Image} from 'react-native';
import DoleImage from '@/assets/images/dole.png';
import BagongPilipinasImage from '@/assets/images/bagongpilipinas.png';

const NavBar = ({title}) => {
  return (
    <View style={styles.header}>
      <Image source={DoleImage} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Image source={BagongPilipinasImage} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',       
    alignItems: 'center',          
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    backgroundColor: '#acb6e2ff',
    height: 60,
  },
   title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,                      
  },
    image: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
});

export default NavBar;


