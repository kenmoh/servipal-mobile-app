import { router, type Href } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import AppButton from "./AppButton";

interface EmptyListProps {
    title: string;
    description: string;
    buttonTitle: string;
    buttonAction?: () => void;
    route?: Href;
}

const EmptyList = ({
    title,
    description,
    buttonTitle,
    buttonAction,
    route,
}: EmptyListProps) => {
    const handlePress = () => {
        if (buttonAction) {
            buttonAction();
            return;
        }
        if (route) {
            router.push(route);
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-background self-center">
            <View className="flex-1 justify-center mt-72 items-center gap-4 p-4">
                <Text className="text-primary font-medium text-2xl text-center">
                    {title}
                </Text>
                <Text className="text-icon-default text-lg text-center font-light">
                    {description}
                </Text>
                <AppButton title={buttonTitle} onPress={handlePress} />
            </View>
        </View>
    );
};

export default EmptyList;
