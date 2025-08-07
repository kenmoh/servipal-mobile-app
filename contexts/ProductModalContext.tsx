import { CreateProductResponse } from '@/types/marketplace';
import React, { createContext, useContext, useRef, useState } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

type ModalContextType = {
    currentProduct: CreateProductResponse | null;
    setCurrentProduct: (product: CreateProductResponse | null) => void;
    isVisible: SharedValue<boolean>;
    cardPosition: React.MutableRefObject<{ x: number; y: number; width: number; height: number } | null>;
    openModal: (product: CreateProductResponse, position: { x: number; y: number; width: number; height: number }) => void;
    closeModal: () => void;
};

const ProductModalContext = createContext<ModalContextType | undefined>(undefined);

export const ProductModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentProduct, setCurrentProduct] = useState<CreateProductResponse | null>(null);
    const isVisible = useSharedValue(false);
    const cardPosition = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

    const openModal = (product: CreateProductResponse, position: { x: number; y: number; width: number; height: number }) => {
        // Close any existing modal first
        if (isVisible.value) {
            isVisible.value = false;
            setTimeout(() => {
                cardPosition.current = position;
                setCurrentProduct(product);
                isVisible.value = true;
            }, 300);
        } else {
            cardPosition.current = position;
            setCurrentProduct(product);
            isVisible.value = true;
        }
    };

    const closeModal = () => {
        isVisible.value = false;
        setTimeout(() => {
            setCurrentProduct(null);
            cardPosition.current = null;
        }, 300);
    };

    return (
        <ProductModalContext.Provider
            value={{
                currentProduct,
                setCurrentProduct,
                isVisible,
                cardPosition,
                openModal,
                closeModal,
            }}
        >
            {children}
        </ProductModalContext.Provider>
    );
};

export const useProductModal = () => {
    const context = useContext(ProductModalContext);
    if (!context) {
        throw new Error('useProductModal must be used within a ProductModalProvider');
    }
    return context;
};
