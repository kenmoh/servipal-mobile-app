import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";

interface ProfileCardProp {
  name: string;
  icon?: React.ReactNode;
  bgColor?: string;
  onPress?: () => void;
  isThemeToggle?: boolean;
  isThemeToggleValue?: boolean;
  children?: React.ReactNode;
}

const ProfileCard = ({
  name,
  icon,
  bgColor,
  onPress,
  isThemeToggle = false,
  isThemeToggleValue = false,
  children,
}: ProfileCardProp) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View className="bg-input my-1 py-3 px-4 w-[90%] self-center rounded-xl">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View
              style={{ backgroundColor: bgColor }}
              className="rounded-full p-2 w-10 h-10 items-center justify-center"
            >
              {icon}
            </View>
            <Text className="text-primary font-poppins text-base">{name}</Text>
          </View>
          {isThemeToggle ? (
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isThemeToggleValue ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={onPress}
              value={isThemeToggleValue}
            />
          ) : children ? null : (
            <ChevronRight size={25} color="#9BA1A6" />
          )}
        </View>
        {children}
      </View>
    </TouchableOpacity>
  );
};

export default ProfileCard;
