import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ProfileProvider } from '../contexts/ProfileContext';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <ProfileProvider>
        <NotificationProvider>
          <NavigationThemeProvider value={DefaultTheme}>
        <Stack initialRouteName="LoginScreen">
          <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
          <Stack.Screen name="SignUpScreen" options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPasswordScreen" options={{ headerShown: false }} />
          <Stack.Screen name="LoginOTPVerificationScreen" options={{ headerShown: false }} />
          <Stack.Screen name="OTPVerificationScreen" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="CollaborationScreen" options={{ headerShown: false }} />
          <Stack.Screen name="PersonDetailScreen" options={{ headerShown: false }} />
          <Stack.Screen name="ProjectDetailScreen" options={{ headerShown: false }} />
          <Stack.Screen name="ClubDetailScreen" options={{ headerShown: false }} />
          <Stack.Screen name="UserProfileScreen" options={{ headerShown: false }} />
          <Stack.Screen name="MessagesScreen" options={{ headerShown: false }} />
          <Stack.Screen name="NotificationsScreen" options={{ headerShown: false }} />
          <Stack.Screen name="ConnectionsScreen" options={{ headerShown: false }} />
          <Stack.Screen name="CollaborationsScreen" options={{ headerShown: false }} />
          <Stack.Screen name="LeaderboardScreen" options={{ headerShown: false }} />
          <Stack.Screen name="SavedScreen" options={{ headerShown: false }} />
          {/* TODO: Re-enable for future group features */}
          {/* <Stack.Screen name="CreateGroupsScreen" options={{ headerShown: false }} /> */}
          {/* <Stack.Screen name="JoinGroupsScreen" options={{ headerShown: false }} /> */}
          <Stack.Screen name="CreateCollaborationScreen" options={{ headerShown: false }} />
          <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
          </NavigationThemeProvider>
        </NotificationProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
