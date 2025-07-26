
import { RefreshCcw } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import AppButton from './AppButton';

const RefreshButton = ({ onPress, label }: { label: string, onPress: () => void }) => {

    return (
        <View
            className='flex-1 justify-center items-center bg-background gap-4'

        >
            <Text className='text-status-error text-[16px]' >
                {label}
            </Text>
            <AppButton

                onPress={onPress}

                title='Try Again'
                icon={<RefreshCcw className='text-primary' size={20} />}
            />


        </View>
    );
}

export default RefreshButton
