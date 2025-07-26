import { useEffect, useRef } from 'react';
import { Notifier, NotifierComponents } from 'react-native-notifier';
import { useNetwork } from './NetworkProvider';

export function NetworkNotifier() {
    const { isConnected } = useNetwork();
    const shown = useRef(false);

    useEffect(() => {
        if (!isConnected && !shown.current) {
            Notifier.showNotification({
                title: 'Network Issue',
                description: 'Your internet connection is poor or lost.',
                Component: NotifierComponents.Alert,
                duration: 0, // stays until dismissed
                componentProps: { alertType: 'warn' },
            });
            shown.current = true;
        } else if (isConnected && shown.current) {
            Notifier.hideNotification();
            shown.current = false;
        }
    }, [isConnected]);

    return null;
} 