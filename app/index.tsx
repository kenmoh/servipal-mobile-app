import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const { user, isFirstLaunch } = useUserStore();

  // Wait for initialization to complete
  if (isFirstLaunch === null) return null;

  // First launch - show onboarding
  if (isFirstLaunch === true) {
    return <Redirect href="/onboarding" />;
  }

  // Not first launch but no user - show sign-in
  if (isFirstLaunch === false && !user) {
    return <Redirect href="/sign-in" />;
  }

  // User exists - go to main app
  if (user) {
    return <Redirect href="/(app)/delivery/(topTabs)" />;
  }

  // Fallback
  return <Redirect href="/sign-in" />;
}
