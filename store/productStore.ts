// import { create } from "zustand";

// // Types based on your schema
// export interface ProductImage {
//   id: string;
//   url: string;
//   item_id: string;
// }

// export interface Product {
//   id: string;
//   user_id: string;
//   total_sold: number;
//   name: string;
//   description: string;
//   price: string;
//   stock: number;
//   category_id: string;
//   sizes: string; // comma-separated string
//   store_name: string;
//   colors: string[];
//   in_stock: boolean;
//   images: ProductImage[];
//   created_at: string;
//   updated_at: string;
// }

// export interface PurchaseData {
//   quantity: number;
//   sizes: string; // comma-separated string of selected sizes
//   colors: string[];
//   additional_info: string;
// }

// export interface PurchaseState {
//   // Product data
//   product: Product | null;

//   // Purchase configuration
//   purchase: PurchaseData;

//   // UI state
//   isLoading: boolean;
//   error: string | null;

//   // Derived state
//   availableSizes: string[];
//   totalPrice: number;
//   isValidPurchase: boolean;

//   // Actions
//   setProduct: (product: Product) => void;
//   clearProduct: () => void;

//   // Quantity actions
//   setQuantity: (quantity: number) => void;
//   incrementQuantity: () => void;
//   decrementQuantity: () => void;

//   // Size actions
//   addSize: (size: string) => void;
//   removeSize: (size: string) => void;
//   toggleSize: (size: string) => void;
// clearSizes: () => void;
// setAllSizes: () => void;

//   // Color actions
// addColor: (color: string) => void;
// removeColor: (color: string) => void;
// toggleColor: (color: string) => void;
// clearColors: () => void;
// setAllColors: () => void;

//   // Additional info
//   setAdditionalInfo: (info: string) => void;

//   // Utility actions
//   resetPurchase: () => void;
//   canPurchase: () => boolean;
//   getTotalItems: () => number;

//   // Async actions
//   setLoading: (loading: boolean) => void;
//   setError: (error: string | null) => void;

//   // Purchase validation
//   validatePurchase: () => { isValid: boolean; errors: string[] };
// }

// const initialPurchaseData: PurchaseData = {
//   quantity: 1,
//   sizes: "",
//   colors: [],
//   additional_info: "",
// };

// export const usePurchaseStore = create<PurchaseState>()((set, get) => ({
//   // Initial state
//   product: null,
//   purchase: initialPurchaseData,
//   isLoading: false,
//   error: null,

//   // Computed properties
//   get availableSizes() {
//     const { product } = get();
//     if (!product?.sizes) return [];
//     return product.sizes
//       .split(",")
//       .map((size) => size.trim())
//       .filter(Boolean);
//   },

//   get totalPrice() {
//     const { product, purchase } = get();
//     if (!product) return 0;
//     const unitPrice = parseFloat(product.price) || 0;
//     return unitPrice * purchase.quantity;
//   },

//   get isValidPurchase() {
//     const { product, purchase } = get();
//     return !!(
//       product &&
//       product.in_stock &&
//       purchase.quantity > 0 &&
//       purchase.quantity <= product.stock &&
//       (purchase.sizes.length > 0 || get().availableSizes.length === 0) &&
//       (purchase.colors.length > 0 || product.colors.length === 0)
//     );
//   },

//   // Product actions
//   setProduct: (product) =>
//     set(
//       (state) => ({
//         product,
//         error: null,
//         // Reset purchase data when product changes
//         purchase: { ...initialPurchaseData },
//       }),
//       false
//     ),

//   clearProduct: () =>
//     set(
//       { product: null, purchase: initialPurchaseData, error: null },
//       false
//     ),

//   // Quantity actions
//   setQuantity: (quantity) => {
//     const { product } = get();
//     const maxQuantity = product?.stock || 0;
//     const validQuantity = Math.max(1, Math.min(quantity, maxQuantity));

//     set(
//       (state) => ({
//         purchase: { ...state.purchase, quantity: validQuantity },
//         error:
//           quantity > maxQuantity
//             ? `Maximum quantity is ${maxQuantity}`
//             : null,
//       }),
//       false
//     );
//   },

//   incrementQuantity: () => {
//     const { purchase } = get();
//     get().setQuantity(purchase.quantity + 1);
//   },

//   decrementQuantity: () => {
//     const { purchase } = get();
//     get().setQuantity(purchase.quantity - 1);
//   },

//   // Size actions
//   addSize: (size) => {
//     const { purchase, availableSizes } = get();
//     if (!availableSizes.includes(size)) return;

//     const currentSizes = purchase.sizes
//       ? purchase.sizes.split(",").map((s) => s.trim())
//       : [];
//     if (!currentSizes.includes(size)) {
//       const newSizes = [...currentSizes, size].join(", ");
//       set(
//         (state) => ({
//           purchase: { ...state.purchase, sizes: newSizes },
//         }),
//         false
//       );
//     }
//   },

//   removeSize: (size) => {
//     const { purchase } = get();
//     const currentSizes = purchase.sizes
//       ? purchase.sizes.split(",").map((s) => s.trim())
//       : [];
//     const newSizes = currentSizes.filter((s) => s !== size).join(", ");
//     set(
//       (state) => ({
//         purchase: { ...state.purchase, sizes: newSizes },
//       }),
//       false
//     );
//   },

//   toggleSize: (size) => {
//     const { purchase } = get();
//     const currentSizes = purchase.sizes
//       ? purchase.sizes.split(",").map((s) => s.trim())
//       : [];

//     if (currentSizes.includes(size)) {
//       get().removeSize(size);
//     } else {
//       get().addSize(size);
//     }
//   },

//   clearSizes: () =>
//     set(
//       (state) => ({
//         purchase: { ...state.purchase, sizes: "" },
//       }),
//       false
//     ),

// setAllSizes: () => {
//   const { availableSizes } = get();
//   const allSizes = availableSizes.join(", ");
//   set(
//     (state) => ({
//       purchase: { ...state.purchase, sizes: allSizes },
//     }),
//     false
//   );
// },

//   // Color actions
//   addColor: (color) => {
//     const { product, purchase } = get();
//     if (!product?.colors.includes(color)) return;

//     if (!purchase.colors.includes(color)) {
//       set(
//         (state) => ({
//           purchase: {
//             ...state.purchase,
//             colors: [...state.purchase.colors, color],
//           },
//         }),
//         false
//       );
//     }
//   },

//   removeColor: (color) =>
//     set(
//       (state) => ({
//         purchase: {
//           ...state.purchase,
//           colors: state.purchase.colors.filter((c) => c !== color),
//         },
//       }),
//       false
//     ),

//   toggleColor: (color) => {
//     const { purchase } = get();
//     if (purchase.colors.includes(color)) {
//       get().removeColor(color);
//     } else {
//       get().addColor(color);
//     }
//   },

//   clearColors: () =>
//     set(
//       (state) => ({
//         purchase: { ...state.purchase, colors: [] },
//       }),
//       false
//     ),

// setAllColors: () => {
//   const { product } = get();
//   if (!product) return;

//   set(
//     (state) => ({
//       purchase: { ...state.purchase, colors: [...product.colors] },
//     }),
//     false
//   );
// },

//   // Additional info
//   setAdditionalInfo: (additional_info) =>
//     set(
//       (state) => ({
//         purchase: { ...state.purchase, additional_info },
//       }),
//       false
//     ),

//   // Utility actions
//   resetPurchase: () =>
//     set({ purchase: initialPurchaseData, error: null }, false),

//   canPurchase: () => {
//     const { product, purchase } = get();
//     return !!(
//       product &&
//       product.in_stock &&
//       purchase.quantity > 0 &&
//       purchase.quantity <= product.stock
//     );
//   },

//   getTotalItems: () => {
//     const { purchase, availableSizes } = get();
//     const selectedSizes = purchase.sizes
//       ? purchase.sizes
//           .split(",")
//           .map((s) => s.trim())
//           .filter(Boolean)
//       : [];
//     const sizeMultiplier = selectedSizes.length || 1;
//     const colorMultiplier = purchase.colors.length || 1;
//     return purchase.quantity * sizeMultiplier * colorMultiplier;
//   },

//   // Async state management
//   setLoading: (isLoading) => set({ isLoading }, false),
//   setError: (error) => set({ error }, false),

//   // Purchase validation
//   validatePurchase: () => {
//     const { product, purchase, availableSizes } = get();
//     const errors: string[] = [];

//     if (!product) {
//       errors.push("No product selected");
//     } else {
//       if (!product.in_stock) {
//         errors.push("Product is out of stock");
//       }

//       if (purchase.quantity <= 0) {
//         errors.push("Quantity must be greater than 0");
//       }

//       if (purchase.quantity > product.stock) {
//         errors.push(`Quantity exceeds available stock (${product.stock})`);
//       }

//       if (availableSizes.length > 0 && !purchase.sizes) {
//         errors.push("Please select at least one size");
//       }

//       if (product.colors.length > 0 && purchase.colors.length === 0) {
//         errors.push("Please select at least one color");
//       }
//     }

//     return {
//       isValid: errors.length === 0,
//       errors,
//     };
//   },
// }));

// // Selectors for common use cases
// export const usePurchaseSelectors = () => {
//   const store = usePurchaseStore();

//   return {
//     // Product selectors
//     product: store.product,
//     hasProduct: !!store.product,
//     productName: store.product?.name || "",
//     productPrice: store.product?.price || "0",

//     // Purchase selectors
//     quantity: store.purchase.quantity,
//     selectedSizes: store.purchase.sizes
//       ? store.purchase.sizes
//           .split(",")
//           .map((s) => s.trim())
//           .filter(Boolean)
//       : [],
//     selectedColors: store.purchase.colors,
//     additionalInfo: store.purchase.additional_info,

//     // Computed selectors
//     availableSizes: store.availableSizes,
//     totalPrice: store.totalPrice,
//     totalItems: store.getTotalItems(),
//     canPurchase: store.isValidPurchase,

//     // State selectors
//     isLoading: store.isLoading,
//     error: store.error,
//     hasError: !!store.error,
//   };
// };

// // Hook for purchase actions only
// export const usePurchaseActions = () => {
//   const store = usePurchaseStore();

//   return {
//     setProduct: store.setProduct,
//     clearProduct: store.clearProduct,
//     setQuantity: store.setQuantity,
//     incrementQuantity: store.incrementQuantity,
//     decrementQuantity: store.decrementQuantity,
//     addSize: store.addSize,
//     removeSize: store.removeSize,
//     toggleSize: store.toggleSize,
//     clearSizes: store.clearSizes,
//     setAllSizes: store.setAllSizes,
//     addColor: store.addColor,
//     removeColor: store.removeColor,
//     toggleColor: store.toggleColor,
//     clearColors: store.clearColors,
//     setAllColors: store.setAllColors,
//     setAdditionalInfo: store.setAdditionalInfo,
//     resetPurchase: store.resetPurchase,
//     setLoading: store.setLoading,
//     setError: store.setError,
//     validatePurchase: store.validatePurchase,
//   };
// };

// import { create } from "zustand";

// export interface ProductImage {
//   id: string;
//   url: string;
//   item_id: string;
// }

// export interface Product {
//   id: string;
//   user_id: string;
//   total_sold: number;
//   name: string;
//   description: string;
//   price: string;
//   stock: number;
//   category_id: string;
//   sizes: string;
//   store_name: string;
//   colors: string[];
//   in_stock: boolean;
//   images: ProductImage[];
//   created_at: string;
//   updated_at: string;
// }

// export interface PurchaseData {
//   quantity: number;
//   sizes: string[];
//   colors: string[];
//   additional_info: string;
// }

// export interface PurchaseState {
//   product: Product | null;
//   purchase: PurchaseData;
//   isLoading: boolean;
//   error: string | null;
//   availableSizes: string[];
//   totalPrice: number;
//   isValidPurchase: boolean;
//   setProduct: (product: Product) => void;
//   clearProduct: () => void;
//   setQuantity: (quantity: number) => void;
//   incrementQuantity: () => void;
//   decrementQuantity: () => void;
//   toggleSize: (size: string) => void;
//   toggleColor: (color: string) => void;
//   setAdditionalInfo: (info: string) => void;
//   resetPurchase: () => void;
//   validatePurchase: () => { isValid: boolean; errors: string[] };
//   getServerSizes: () => string;
// }

// const initialPurchaseData: PurchaseData = {
//   quantity: 1,
//   sizes: [],
//   colors: [],
//   additional_info: "",
// };

// export const usePurchaseStore = create<PurchaseState>((set, get) => ({
//   product: null,
//   purchase: initialPurchaseData,
//   isLoading: false,
//   error: null,

//   get availableSizes() {
//     const product = get().product;
//     return product?.sizes
//       ? product.sizes.split(",").map((s) => s.trim()).filter(Boolean)
//       : [];
//   },

//   get totalPrice() {
//     const { product, purchase } = get();
//     if (!product) return 0;
//     const unitPrice = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
//     return unitPrice * purchase.quantity;
//   },

//   get isValidPurchase() {
//     const { product, purchase } = get();
//     return !!(
//       product &&
//       product.in_stock &&
//       purchase.quantity > 0 &&
//       purchase.quantity <= product.stock &&
//       (purchase.sizes.length > 0 || get().availableSizes.length === 0) &&
//       (purchase.colors.length > 0 || product.colors.length === 0)
//     );
//   },

//   setProduct: (product) =>
//     set({
//       product,
//       purchase: initialPurchaseData,
//       error: null,
//     }),

//   clearProduct: () =>
//     set({
//       product: null,
//       purchase: initialPurchaseData,
//       error: null,
//     }),

//   setQuantity: (quantity) => {
//     const maxQuantity = get().product?.stock || 0;
//     const validQuantity = Math.max(1, Math.min(quantity, maxQuantity));
//     set((state) => ({
//       purchase: { ...state.purchase, quantity: validQuantity },
//       error: quantity > maxQuantity ? `Maximum quantity is ${maxQuantity}` : null,
//     }));
//   },

//   incrementQuantity: () => {
//     const { purchase } = get();
//     get().setQuantity(purchase.quantity + 1);
//   },

//   decrementQuantity: () => {
//     const { purchase } = get();
//     get().setQuantity(purchase.quantity - 1);
//   },

//   toggleSize: (size) => {
//     const { purchase, availableSizes } = get();
//     if (!availableSizes.includes(size)) return;

//     set((state) => ({
//       purchase: {
//         ...state.purchase,
//         sizes: purchase.sizes.includes(size)
//           ? purchase.sizes.filter((s) => s !== size)
//           : [...purchase.sizes, size],
//       },
//     }));
//   },

//   toggleColor: (color) => {
//     const { purchase, product } = get();
//     if (!product?.colors.includes(color)) return;

//     set((state) => ({
//       purchase: {
//         ...state.purchase,
//         colors: purchase.colors.includes(color)
//           ? purchase.colors.filter((c) => c !== color)
//           : [...purchase.colors, color],
//       },
//     }));
//   },

//   setAdditionalInfo: (additional_info) =>
//     set((state) => ({
//       purchase: { ...state.purchase, additional_info },
//     })),

//   resetPurchase: () =>
//     set({
//       purchase: initialPurchaseData,
//       error: null,
//     }),

//   validatePurchase: () => {
//     const { product, purchase, availableSizes } = get();
//     const errors: string[] = [];

//     if (!product) {
//       errors.push("No product selected");
//     } else {
//       if (!product.in_stock) {
//         errors.push("Product is out of stock");
//       }
//       if (purchase.quantity <= 0) {
//         errors.push("Quantity must be greater than 0");
//       }
//       if (purchase.quantity > product.stock) {
//         errors.push(`Quantity exceeds available stock (${product.stock})`);
//       }
//       if (availableSizes.length > 0 && purchase.sizes.length === 0) {
//         errors.push("Please select at least one size");
//       }
//       if (product.colors.length > 0 && purchase.colors.length === 0) {
//         errors.push("Please select at least one color");
//       }
//     }

//     return {
//       isValid: errors.length === 0,
//       errors,
//     };
//   },

//   getServerSizes: () => {
//     const { purchase } = get();
//     return purchase.sizes.join(", ");
//   },
// }));

// export const usePurchaseSelectors = () => {
//   const store = usePurchaseStore();
//   return {
//     product: store.product,
//     quantity: store.purchase.quantity,
//     selectedSizes: store.purchase.sizes,
//     selectedColors: store.purchase.colors,
//     additionalInfo: store.purchase.additional_info,
//     availableSizes: store.availableSizes,
//     totalPrice: store.totalPrice,
//     isValidPurchase: store.isValidPurchase,
//     isLoading: store.isLoading,
//     error: store.error,
//     serverSizes: store.getServerSizes(),
//   };
// };

// export const usePurchaseActions = () => {
//   const store = usePurchaseStore();
//   return {
//     setProduct: store.setProduct,
//     clearProduct: store.clearProduct,
//     setQuantity: store.setQuantity,
//     incrementQuantity: store.incrementQuantity,
//     decrementQuantity: store.decrementQuantity,
//     toggleSize: store.toggleSize,
//     toggleColor: store.toggleColor,
//     setAdditionalInfo: store.setAdditionalInfo,
//     resetPurchase: store.resetPurchase,
//     validatePurchase: store.validatePurchase,
//     getServerSizes: store.getServerSizes,
//   };
// };

import { create } from "zustand";

export interface ProductImage {
  id: string;
  url: string;
  item_id: string;
}

export interface Product {
  id: string;
  user_id: string;
  total_sold: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  category_id: string;
  sizes: string;
  store_name: string;
  colors: string[];
  in_stock: boolean;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseData {
  quantity: number;
  sizes: string[];
  colors: string[];
  additional_info: string;
}

export interface PurchaseState {
  product: Product | null;
  purchase: PurchaseData;
  isLoading: boolean;
  error: string | null;
  totalPrice: number;
  isValidPurchase: boolean;
  setProduct: (product: Product) => void;
  clearProduct: () => void;
  setQuantity: (quantity: number) => void;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  toggleSize: (size: string) => void;
  toggleColor: (color: string) => void;
  setAdditionalInfo: (info: string) => void;
  resetPurchase: () => void;
  validatePurchase: () => { isValid: boolean; errors: string[] };
  getServerSizes: () => string;
  addSize: (size: string) => void;
  removeSize: (size: string) => void;
  addColor: (color: string) => void;
  removeColor: (color: string) => void;
  clearColors: () => void;
  setAllColors: () => void;
  clearSizes: () => void;
  setAllSizes: () => void;
}

const initialPurchaseData: PurchaseData = {
  quantity: 1,
  sizes: [],
  colors: [],
  additional_info: "",
};

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  product: null,
  purchase: initialPurchaseData,
  isLoading: false,
  error: null,

  get totalPrice() {
    const { product, purchase } = get();
    if (!product) return 0;

    const price =
      typeof product.price === "string"
        ? Number(product.price)
        : Number(product.price);

    return price * purchase.quantity;
  },

  get isValidPurchase() {
    const { product, purchase } = get();

    const availableSizes = product?.sizes
      ? product.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    return !!(
      product &&
      product.in_stock &&
      purchase.quantity > 0 &&
      purchase.quantity <= product.stock &&
      (purchase.sizes.length > 0 || availableSizes.length === 0) &&
      (purchase.colors.length > 0 || product.colors.length === 0)
    );
  },

  setProduct: (product) =>
    set({
      product,
      purchase: initialPurchaseData,
      error: null,
    }),

  clearProduct: () =>
    set({
      product: null,
      purchase: initialPurchaseData,
      error: null,
    }),

  setQuantity: (quantity) => {
    const maxQuantity = get().product?.stock || 0;
    const validQuantity = Math.max(1, Math.min(quantity, maxQuantity));
    set((state) => ({
      purchase: { ...state.purchase, quantity: validQuantity },
      error:
        quantity > maxQuantity ? `Maximum quantity is ${maxQuantity}` : null,
    }));
  },

  incrementQuantity: () => {
    const { purchase } = get();
    get().setQuantity(purchase.quantity + 1);
  },

  decrementQuantity: () => {
    const { purchase } = get();
    get().setQuantity(purchase.quantity - 1);
  },

  toggleSize: (size) => {
    const product = get().product;
    const availableSizes = product?.sizes
      ? product.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (!availableSizes.includes(size)) return;

    const { purchase } = get();
    set((state) => ({
      purchase: {
        ...state.purchase,
        sizes: purchase.sizes.includes(size)
          ? purchase.sizes.filter((s) => s !== size)
          : [...purchase.sizes, size],
      },
    }));
  },

  addSize: (size) => {
    const product = get().product;
    const availableSizes = product?.sizes
      ? product.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (!availableSizes.includes(size)) return;

    set((state) => {
      if (!state.purchase.sizes.includes(size)) {
        return {
          purchase: {
            ...state.purchase,
            sizes: [...state.purchase.sizes, size],
          },
        };
      }
      return state;
    });
  },

  removeSize: (size) => {
    set((state) => ({
      purchase: {
        ...state.purchase,
        sizes: state.purchase.sizes.filter((s) => s !== size),
      },
    }));
  },

  clearSizes: () =>
    set((state) => ({
      purchase: { ...state.purchase, sizes: [] },
    })),
  setAllSizes: () => {
    const product = get().product;
    const availableSizes = product?.sizes
      ? product.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    set((state) => ({
      purchase: {
        ...state.purchase,
        sizes: availableSizes,
      },
    }));
  },

  toggleColor: (color) => {
    const { purchase, product } = get();
    if (!product?.colors.includes(color)) return;

    set((state) => ({
      purchase: {
        ...state.purchase,
        colors: purchase.colors.includes(color)
          ? purchase.colors.filter((c) => c !== color)
          : [...purchase.colors, color],
      },
    }));
  },

  addColor: (color) => {
    const { product, purchase } = get();
    if (!product?.colors.includes(color)) return;

    set((state) => {
      if (!state.purchase.colors.includes(color)) {
        return {
          purchase: {
            ...state.purchase,
            colors: [...state.purchase.colors, color],
          },
        };
      }
      return state;
    });
  },

  removeColor: (color) => {
    set((state) => ({
      purchase: {
        ...state.purchase,
        colors: state.purchase.colors.filter((c) => c !== color),
      },
    }));
  },

  clearColors: () =>
    set((state) => ({
      purchase: { ...state.purchase, colors: [] },
    })),

  setAllColors: () => {
    const { product } = get();
    if (!product) return;

    set(
      (state) => ({
        purchase: { ...state.purchase, colors: [...product.colors] },
      }),
      false
    );
  },

  setAdditionalInfo: (info) =>
    set((state) => ({
      purchase: { ...state.purchase, additional_info: info },
    })),

  resetPurchase: () =>
    set({
      purchase: initialPurchaseData,
      error: null,
    }),

  validatePurchase: () => {
    const { product, purchase } = get();
    const errors: string[] = [];

    const availableSizes = product?.sizes
      ? product.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (!product) {
      errors.push("No product selected");
    } else {
      if (!product.in_stock) errors.push("Product is out of stock");
      if (purchase.quantity <= 0)
        errors.push("Quantity must be greater than 0");
      if (purchase.quantity > product.stock)
        errors.push(`Quantity exceeds available stock (${product.stock})`);
      if (!purchase.additional_info) {
        errors.push(`Delivery information is required`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  getServerSizes: () => {
    const { purchase } = get();
    return purchase.sizes.join(", ");
  },
}));

export const usePurchaseSelectors = () => {
  const store = usePurchaseStore();
  const product = store.product;

  const availableSizes = product?.sizes
    ? product.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    product,
    quantity: store.purchase.quantity,
    selectedSizes: store.purchase.sizes,
    selectedColors: store.purchase.colors,
    additionalInfo: store.purchase.additional_info,
    availableSizes,
    totalPrice: store.totalPrice,
    isValidPurchase: store.isValidPurchase,
    isLoading: store.isLoading,
    error: store.error,
    serverSizes: store.getServerSizes(),
  };
};

export const usePurchaseActions = () => {
  const store = usePurchaseStore();
  return {
    setProduct: store.setProduct,
    clearProduct: store.clearProduct,
    setQuantity: store.setQuantity,
    incrementQuantity: store.incrementQuantity,
    decrementQuantity: store.decrementQuantity,
    addSize: store.addSize,
    removeSize: store.removeSize,
    clearColors: store.clearColors,
    clearSizes: store.clearSizes,
    setAllColors: store.setAllColors,
    setAllSizes: store.setAllSizes,
    toggleSize: store.toggleSize,
    toggleColor: store.toggleColor,
    setAdditionalInfo: store.setAdditionalInfo,
    resetPurchase: store.resetPurchase,
    addColor: store.addColor,
    removeColor: store.removeColor,
    validatePurchase: store.validatePurchase,
    getServerSizes: store.getServerSizes,
  };
};
