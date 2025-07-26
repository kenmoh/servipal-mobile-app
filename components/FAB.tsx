import { Send } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

const FAB = ({
    onPress,
    icon,
    disabled,
}: {
    disabled?: boolean;
    icon?: React.ReactNode;
    onPress: () => void;
}) => {
    return (
        <TouchableOpacity
            className="bg-button-primary rounded-full absolute bottom-5 right-5 p-2 w-[50px] h-[50px] items-center justify-center"
            disabled={disabled}
            onPress={onPress}
        >
            {icon || <Send color="white" size={25} />}
        </TouchableOpacity>
    );
};

export default FAB;
