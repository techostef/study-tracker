import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/contexts/AppContext';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="study/create"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'New Study',
            headerStyle: { backgroundColor: Colors.white },
            headerTintColor: Colors.text,
          }}
        />
        <Stack.Screen
          name="study/[id]"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Edit Study',
            headerStyle: { backgroundColor: Colors.white },
            headerTintColor: Colors.text,
          }}
        />
        <Stack.Screen
          name="category/create"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'New Category',
            headerStyle: { backgroundColor: Colors.white },
            headerTintColor: Colors.text,
          }}
        />
        <Stack.Screen
          name="category/[id]"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Edit Category',
            headerStyle: { backgroundColor: Colors.white },
            headerTintColor: Colors.text,
          }}
        />
        <Stack.Screen
          name="reminder/index"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Reminder',
            headerStyle: { backgroundColor: Colors.white },
            headerTintColor: Colors.text,
          }}
        />
      </Stack>
    </AppProvider>
  );
}
