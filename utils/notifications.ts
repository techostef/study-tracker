import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '@/constants/Types';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('study-reminders', {
      name: 'Study Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

export async function scheduleReminders(
  reminders: Reminder[],
  incompleteCount: number,
  userName: string
): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (incompleteCount === 0) return;

  for (const reminder of reminders) {
    if (!reminder.enabled) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `📚 Hey ${userName}, time to study!`,
        body: `You still have ${incompleteCount} ${incompleteCount === 1 ? 'study' : 'studies'} to complete. Keep going!`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: reminder.minute,
        channelId: Platform.OS === 'android' ? 'study-reminders' : undefined,
      },
    });
  }
}

export async function sendRewardNotification(
  studyTitle: string,
  userName: string
): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🎉 Congratulations ${userName}!`,
      body: `You completed "${studyTitle}"! Amazing work! 🏆`,
      sound: true,
    },
    trigger: null,
  });
}
