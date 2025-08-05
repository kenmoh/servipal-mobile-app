import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useBottomNavigationHeight = () => {
  const insets = useSafeAreaInsets();

  if (Platform.OS === "android") {
    // Android bottom navigation height (typically 48dp)
    return 48;
  }

  // iOS uses safe area insets
  return insets.bottom;
};

// Alternative method using Dimensions
export const getBottomNavigationHeight = () => {
  if (Platform.OS === "android") {
    // You can also use a more dynamic approach
    const { height } = require("react-native").Dimensions.get("window");

    // Common Android bottom navigation heights:
    // - 48dp (most common)
    // - 56dp (Material Design 3)
    // - 64dp (some custom implementations)

    // For most cases, 48dp works well
    return 48;
  }

  return 0; // iOS will use safe area insets
};

// Method 3: Using React Navigation's useBottomTabBarHeight (if using bottom tabs)
// import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
//
// export const useBottomTabBarHeightFromNavigation = () => {
//   try {
//     return useBottomTabBarHeight();
//   } catch {
//     // Fallback if not in a bottom tab navigator
//     return useBottomNavigationHeight();
//   }
// };
