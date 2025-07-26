import { ActivityIndicator, View } from "react-native";


function LoadingIndicator({ size = 'large' }: { size?: 'large' | 'small' }) {


  return (
    <View
      className="flex-1 items-center justify-center bg-background"

    >
      <ActivityIndicator size={size} className="text-icon-default" />
    </View>
  );
}

export default LoadingIndicator;
