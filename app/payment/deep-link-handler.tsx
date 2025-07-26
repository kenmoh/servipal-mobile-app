import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Text, useColorScheme, View } from 'react-native';
import { Notifier, NotifierComponents } from 'react-native-notifier';


const DeepLinkHandler = () => {

    const params = useLocalSearchParams();

    useEffect(() => {


        // Parse URL parameters
        const urlParams = new URLSearchParams(params.url as string);
        const status = urlParams.get('status') || params.status as string;
        const txRef = urlParams.get('tx_ref') || params.txRef as string;
        const transactionId = urlParams.get('transaction_id') || params.transactionId as string;


        if (!status) {
            console.error('Deep Link Handler - Missing status parameter');
            Notifier.showNotification({
                title: 'Error',
                description: 'Missing payment status',
                Component: NotifierComponents.Alert,
                componentProps: { alertType: 'error' },
            });
            router.replace('/delivery');
            return;
        }

        // Convert status to lowercase for consistent comparison
        const normalizedStatus = status.toLowerCase();


        switch (normalizedStatus) {
            case 'successful':

                router.replace({
                    pathname: '/payment/payment-complete',
                    params: {
                        paymentStatus: 'success',
                        txRef,
                        transactionId
                    }
                });
                break;
            case 'failed':

                router.replace({
                    pathname: '/payment/payment-complete',
                    params: {
                        paymentStatus: 'failed',
                        txRef,
                        transactionId
                    }
                });
                break;
            case 'cancelled':

                router.replace({
                    pathname: '/payment/payment-complete',
                    params: {
                        paymentStatus: 'failed',
                        txRef,
                        transactionId
                    }
                });
                break;
            default:
                console.error('Deep Link Handler - Invalid payment status:', normalizedStatus);
                Notifier.showNotification({
                    title: 'Error',
                    description: 'Invalid payment status',
                    Component: NotifierComponents.Alert,
                    componentProps: { alertType: 'error' },
                });
                router.replace('/delivery');
                break;
        }
    }, [params]);

    return (
        <View className='flex-1 bg-background items-center justify-center' >
            <View className='gap-4 items-center p-4' >
                <Text className="text-[16px] text-primary font-poppins-medium text-center">
                    Processing payment...
                </Text>
            </View>
        </View>
    );
};

export default DeepLinkHandler; 