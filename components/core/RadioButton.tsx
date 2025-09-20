import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RadioButtonProps {
    label: string;
    selected: boolean;
    onPress: () => void;
}

const RadioButton = ({ label, selected, onPress }: RadioButtonProps) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <View style={[styles.radio, selected && styles.selectedRadio]}>
                {selected && <View style={styles.radioInner} />}
            </View>
            <Text className='text-primary font-poppins' style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'center',
        marginTop: 5
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'orange',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    selectedRadio: {
        backgroundColor: '#fff',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'orange'
    },
    label: {
        fontSize: 16,
    },
});

export default RadioButton;
