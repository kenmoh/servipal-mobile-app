import { useState } from 'react';
import { ToastProps } from '@/components/Toast';

interface ToastItem extends ToastProps {
    id: string;
}

/**
 * Simple standalone toast hook for quick toast usage without provider
 * Useful for single-screen implementations or when you don't want to set up a provider
 */
export const useSimpleToast = () => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const showToast = (toast: Omit<ToastProps, 'onDismiss'>) => {
        const id = toast.id || generateId();
        const newToast: ToastItem = { ...toast, id };

        setToasts((prevToasts) => [...prevToasts, newToast]);
    };

    const showSuccess = (title: string, message?: string, duration: number = 4000) => {
        showToast({
            title,
            message,
            type: 'success',
            duration,
        });
    };

    const showError = (title: string, message?: string, duration: number = 5000) => {
        showToast({
            title,
            message,
            type: 'error',
            duration,
        });
    };

    const showWarning = (title: string, message?: string, duration: number = 4000) => {
        showToast({
            title,
            message,
            type: 'warning',
            duration,
        });
    };

    const showInfo = (title: string, message?: string, duration: number = 4000) => {
        showToast({
            title,
            message,
            type: 'info',
            duration,
        });
    };

    const dismissToast = (id: string) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    const dismissAllToasts = () => {
        setToasts([]);
    };

    return {
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismissToast,
        dismissAllToasts,
    };
};

export default useSimpleToast;
