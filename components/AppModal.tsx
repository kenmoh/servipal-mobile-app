import React from 'react';
import { DimensionValue, Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';



interface AppModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    height?: string

}

const AppModal = ({ visible, onClose, children, height = '100%' }: AppModalProps) => {


    return (
        <Modal

            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View className='bg-background' style={[styles.modalContent, {
                            height: height as DimensionValue,

                            borderTopRightRadius: height === '100%' ? 0 : 25,
                            borderTopLeftRadius: height === '100%' ? 0 : 25,
                        }]}>
                            {children}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,

        width: '100%',

        paddingTop: 20,
        paddingHorizontal: 10,
    },
});

export default AppModal;