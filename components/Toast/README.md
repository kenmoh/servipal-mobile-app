# Toast Notification System

A reusable, animated toast notification system for React Native with TypeScript support.

## Features

- ✅ Smooth animations (slide from top/bottom with opacity)
- ✅ Auto-dismiss with customizable duration
- ✅ Manual dismiss with close button
- ✅ Multiple toast types (success, error, warning, info)
- ✅ Custom colors and positioning
- ✅ Stack multiple toasts
- ✅ TypeScript support
- ✅ Two usage patterns: Provider-based and standalone hook

## Installation

The components are already created in your project:
- `components/Toast.tsx` - Main Toast component
- `components/ToastProvider.tsx` - Provider and context
- `hooks/useSimpleToast.tsx` - Standalone hook
- `components/ToastExample.tsx` - Usage examples

## Usage

### Method 1: Using ToastProvider (Recommended)

**1. Wrap your app with ToastProvider:**

```tsx
// app/_layout.tsx or your root component
import { ToastProvider } from '@/components/ToastProvider';

export default function RootLayout() {
  return (
    <ToastProvider maxToasts={3}>
      {/* Your app content */}
    </ToastProvider>
  );
}
```

**2. Use the useToast hook in any component:**

```tsx
import { useToast } from '@/components/ToastProvider';

export default function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo, showToast } = useToast();

  const handleSuccess = () => {
    showSuccess('Success!', 'Operation completed successfully');
  };

  const handleError = () => {
    showError('Error!', 'Something went wrong');
  };

  const handleCustomToast = () => {
    showToast({
      title: 'Custom Toast',
      message: 'This is a custom colored toast',
      customColor: '#8B5CF6',
      duration: 8000,
      position: 'bottom'
    });
  };

  // ... rest of your component
}
```

### Method 2: Using Simple Toast Hook

For single-screen usage or when you don't want to set up a provider:

```tsx
import { useSimpleToast } from '@/hooks/useSimpleToast';
import Toast from '@/components/Toast';

export default function MyScreen() {
  const {
    toasts,
    showSuccess,
    showError,
    dismissToast
  } = useSimpleToast();

  return (
    <View style={{ flex: 1 }}>
      {/* Your screen content */}
      
      {/* Render toasts */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        {toasts.map((toast, index) => (
          <View
            key={toast.id}
            style={{ transform: [{ translateY: index * 80 }] }}
          >
            <Toast
              {...toast}
              onDismiss={() => dismissToast(toast.id!)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
```

## API Reference

### ToastProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Toast title (required) |
| `message` | `string` | - | Toast message (optional) |
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Toast type |
| `duration` | `number` | `4000` | Auto-dismiss duration in ms (0 = no auto-dismiss) |
| `customColor` | `string` | - | Custom background color |
| `position` | `'top' \| 'bottom'` | `'top'` | Toast position |
| `onDismiss` | `() => void` | - | Callback when toast is dismissed |

### useToast Hook Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `showSuccess` | `(title, message?, duration?)` | Show success toast |
| `showError` | `(title, message?, duration?)` | Show error toast |
| `showWarning` | `(title, message?, duration?)` | Show warning toast |
| `showInfo` | `(title, message?, duration?)` | Show info toast |
| `showToast` | `(toastProps)` | Show custom toast |
| `dismissToast` | `(id)` | Dismiss specific toast |
| `dismissAllToasts` | `()` | Dismiss all toasts |

## Examples

### Basic Usage
```tsx
const { showSuccess, showError } = useToast();

// Simple success toast
showSuccess('Payment Successful!');

// Success with message
showSuccess('Payment Successful!', 'Your order has been processed');

// Error with longer duration
showError('Payment Failed!', 'Please try again later', 8000);
```

### Custom Toasts
```tsx
const { showToast } = useToast();

// Custom color and position
showToast({
  title: 'Custom Notification',
  message: 'This appears at the bottom in purple',
  customColor: '#8B5CF6',
  position: 'bottom',
  duration: 6000
});

// Persistent toast (manual dismiss only)
showToast({
  title: 'Important Notice',
  message: 'This stays until you dismiss it',
  type: 'warning',
  duration: 0
});
```

### Using in Payment Flow (Your Use Case)
```tsx
// In your payment success handler
const { showSuccess, showError } = useToast();

const handlePaymentResult = (paymentStatus: string) => {
  if (paymentStatus === 'successful') {
    showSuccess(
      'Payment Successful!',
      'Your payment has been processed successfully'
    );
  } else {
    showError(
      'Payment Failed!',
      'There was an error processing your payment. Please try again.'
    );
  }
};
```

## Styling

The toast uses your project's existing styling approach:
- Uses `lucide-react-native` icons (already in your project)
- Follows the color scheme and fonts from your project
- Uses both inline styles and className for consistency
- Responsive design with proper shadows and elevation

## Colors

Default colors by type:
- **Success**: `#10B981` (green-500)
- **Error**: `#EF4444` (red-500)
- **Warning**: `#F59E0B` (amber-500)
- **Info**: `#3B82F6` (blue-500)

## Notes

- Toasts are automatically stacked with 80px offset
- Maximum 3 toasts by default (configurable in ToastProvider)
- Uses native animations for smooth performance
- Fully typed with TypeScript
- Icons and styling match your existing design system
