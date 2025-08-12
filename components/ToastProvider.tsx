import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import Toast, { ToastProps, ToastType } from './Toast';

interface ToastContextType {
    showToast: (toast: Omit<ToastProps, 'onDismiss'>) => void;
    showSuccess: (title: string, message?: string, duration?: number) => void;
    showError: (title: string, message?: string, duration?: number) => void;
    showWarning: (title: string, message?: string, duration?: number) => void;
    showInfo: (title: string, message?: string, duration?: number) => void;
    dismissToast: (id: string) => void;
    dismissAllToasts: () => void;
}

interface ToastItem extends ToastProps {
    id: string;
}

const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
    children: ReactNode;
    maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
    children, 
    maxToasts = 3 
}) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const generateId = useCallback(() => Math.random().toString(36).substr(2, 9), []);

    const showToast = useCallback((toast: Omit<ToastProps, 'onDismiss'>) => {
        const id = toast.id || generateId();
        const newToast: ToastItem = { ...toast, id };

        setToasts((prevToasts) => {
            let updatedToasts = [...prevToasts, newToast];
            
            // Limit the number of toasts
            if (updatedToasts.length > maxToasts) {
                updatedToasts = updatedToasts.slice(-maxToasts);
            }
            
            return updatedToasts;
        });
    }, [generateId, maxToasts]);

    const showSuccess = useCallback((title: string, message?: string, duration: number = 4000) => {
        showToast({
            title,
            message,
            type: 'success',
            duration,
        });
    }, [showToast]);

    const showError = useCallback((title: string, message?: string, duration: number = 5000) => {
        showToast({
            title,
            message,
            type: 'error',
            duration,
        });
    }, [showToast]);

    const showWarning = useCallback((title: string, message?: string, duration: number = 4000) => {
        showToast({
            title,
            message,
            type: 'warning',
            duration,
        });
    }, [showToast]);

    const showInfo = useCallback((title: string, message?: string, duration: number = 4000) => {
        showToast({
            title,
            message,
            type: 'info',
            duration,
        });
    }, [showToast]);

    const dismissToast = useCallback((id: string) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    const dismissAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    const value = useMemo<ToastContextType>(() => ({
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismissToast,
        dismissAllToasts,
    }), [showToast, showSuccess, showError, showWarning, showInfo, dismissToast, dismissAllToasts]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                {toasts.map((toast, index) => (
                    <View
                        key={toast.id}
                        style={{
                            transform: [{ translateY: index * 80 }],
                        }}
                    >
                        <Toast
                            {...toast}
                            onDismiss={() => dismissToast(toast.id)}
                        />
                    </View>
                ))}
            </View>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export default ToastProvider;
