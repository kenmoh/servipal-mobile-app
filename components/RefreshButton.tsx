
import { RefreshCcw } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import AppVariantButton from './core/AppVariantButton';

const RefreshButton = ({ onPress, label }: { label: string, onPress: () => void }) => {

    return (
        <View
            className='flex-1 justify-center bg-background items-center gap-4'

        >
            <Text className='text-status-error text-sm font-poppins' >
                {label}
            </Text>
            <AppVariantButton
                filled={false}
                onPress={onPress}
                backgroundColor='orange'
                borderRadius={50}
                outline={true}
                width={'40%'}
                label='Try Again'
                icon={<RefreshCcw color='orange' size={20} />}
            />


        </View>
    );
}

export default RefreshButton
