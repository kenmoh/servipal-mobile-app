import { Eye, EyeOff } from 'lucide-react-native'
import { useState } from 'react'
import { DimensionValue, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native'

interface InputProp extends TextInputProps {
    label?: string,
    multiline?: boolean
    numberOfLines?: number
    height?: number
    value?: string
    width?: DimensionValue
    errorMessage?: string
    borderRadius?: number
    onPressIn?: () => void;
    showPasswordToggle?: boolean;
}
const AppTextInput = ({ label, numberOfLines, multiline, value, onPressIn, placeholder, onBlur, onChangeText, errorMessage, width = '100%', borderRadius = 10, height = 45, keyboardType = 'default', editable = true, secureTextEntry = false, showPasswordToggle = false }: InputProp) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const shouldShowToggle = showPasswordToggle && secureTextEntry;
    const isPasswordVisible = shouldShowToggle ? showPassword : false;

    return (
        <View className="w-[90%] my-2 items-center self-center">
            {label && (
                <Text className="text-muted mb-1 self-start font-poppins text-sm">{label}</Text>
            )}
            <View className="w-full relative flex-row items-center">
                <TextInput
                    editable={editable}
                    value={value}
                    onPressIn={onPressIn}
                    style={{
                        height,
                        borderRadius,
                        width,
                    }}
                    multiline={multiline}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    numberOfLines={numberOfLines}
                    className="bg-input px-4 text-primary text-base font-mono w-full focus:border-[0.7px] border-border-subtle focus:border-button-primary"
                    keyboardType={keyboardType}
                    secureTextEntry={shouldShowToggle ? !isPasswordVisible : false}
                    onBlur={onBlur}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#aaa"
                />
                {shouldShowToggle && (
                    <TouchableOpacity
                        onPress={togglePasswordVisibility}
                        style={{ position: 'absolute', right: 15, padding: 5 }}
                    >
                        {showPassword ? (
                            <EyeOff size={20} color="#9BA1A6" />
                        ) : (
                            <Eye size={20} color="#9BA1A6" />
                        )}
                    </TouchableOpacity>
                )}
            </View>
            {errorMessage && (
                <Text className="text-status-error text-sm font-poppins self-start mt-1">{errorMessage}</Text>
            )}
        </View>
    )
}

export default AppTextInput