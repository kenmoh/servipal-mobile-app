import { useToast } from '@/components/ToastProvider';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';



const DeepLinkHandler = () => {
    const { showError, showSuccess } = useToast()

    const params = useLocalSearchParams();

    useEffect(() => {


        // Parse URL parameters
        const urlParams = new URLSearchParams(params.url as string);
        const status = urlParams.get('status') || params.status as string;
        const txRef = urlParams.get('tx_ref') || params.txRef as string;
        const transactionId = urlParams.get('transaction_id') || params.transactionId as string;


        if (!status) {
            showError("Error", 'Missing payment status')

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

                showError("Error", 'Invalid payment status')


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