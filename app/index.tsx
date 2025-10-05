import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const { user, isFirstLaunch, checkFirstLaunch } = useUserStore();

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  if (isFirstLaunch === null) return null;

  if (isFirstLaunch) {
    return <Redirect href="/onboarding" />;
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return <Redirect href="/(app)/delivery/(topTabs)" />;
}
