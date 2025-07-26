import { Text, TouchableOpacity } from "react-native"



const AddItemBtn = ({ onPress, icon, isDisabled = false, label = 'Add Menu' }: { label?: string, isDisabled?: boolean, icon?: React.ReactNode, onPress: () => void }) => {

    return (
        <TouchableOpacity
            className="bg-button-primary flex-row px-3 mr-2 self-end rounded-full py-2 items-center justify-center gap-2"

            disabled={isDisabled}
            onPress={onPress}


        >
            {icon}
            <Text className="text-primary font-poppins text-sm">
                {label}
            </Text>
        </TouchableOpacity>
    )
}

export default AddItemBtn
