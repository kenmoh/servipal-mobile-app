import React from "react";
import { Text, TouchableOpacity } from "react-native";

import { DimensionValue } from "react-native";

interface BtnProps {
    title: string;
    width?: DimensionValue;
    height?: number;
    borderRadius?: number;
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    onPress?: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
}

const AppButton = ({
    title,
    borderRadius,
    backgroundColor,
    color,
    fontSize,
    width = "90%",
    height = 45,
    icon,
    disabled = false,
    ...props
}: BtnProps) => {

    return (
        <TouchableOpacity
            disabled={disabled}
            activeOpacity={0.8}
            {...props}
            style={{
                backgroundColor: 'orange',
                height: height,
                width: width,
                alignSelf: "center",
                borderRadius: borderRadius || 10,
                justifyContent: "center",
                alignItems: "center",
                gap: icon ? 8 : 0,
                flexDirection: icon ? "row" : "column",
            }}

        >{icon}
            <Text
                className="font-poppins font-medium text-red-500 uppercase text-base tracking-wide"
                style={{
                    color: color || "#fff",
                    fontSize: fontSize || 16,
                }}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default AppButton;
