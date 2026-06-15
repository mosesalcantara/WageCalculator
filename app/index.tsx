import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EstablishmentsPage = () => {
  const [showContent, setShowContent] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [animation]);

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      const backhandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );

      return () => backhandler.remove();
    }, []),
  );

  const animatedStyle = {
    backgroundColor: animation.interpolate({
      inputRange: [0, 0.5],
      outputRange: ["#1e960b", "#0b6396"],
    }),
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 0.5],
          outputRange: [1, 1.03],
        }),
      },
    ],
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 items-center justify-center">
        <Image
          source={require("../assets/images/DOLECalcLogo.png")}
          className="mb-8 h-[290px] w-[290px]"
        />
        <Text className="mb-8 text-3xl font-bold ">DOLECalc</Text>
        <Animated.View
          style={animatedStyle}
          className="mb-8 overflow-hidden rounded-lg"
        >
          <Pressable
            onPress={() => router.navigate("/homepage/index")}
            className="px-8 py-3"
          >
            <Text className="font-regular text-lg font-semibold text-white">
              Get Started
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default EstablishmentsPage;
