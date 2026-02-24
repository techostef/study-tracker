import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '@/constants/Types';

const REMINDER_CHANNEL_ID = 'study-reminders-alarm';
const REWARD_CHANNEL_ID = 'study-rewards';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    }),
  });
}

async function setupAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Study Reminders',
    description: 'Daily study reminder alarms',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 400, 200, 400],
    enableVibrate: true,
    showBadge: true,
    enableLights: true,
    lightColor: '#4F46E5',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: true,
  });

  await Notifications.setNotificationChannelAsync(REWARD_CHANNEL_ID, {
    name: 'Study Rewards',
    description: 'Notifications when you complete a study',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 100, 250],
    enableVibrate: true,
    showBadge: true,
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowCriticalAlerts: true,
      },
    });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  await setupAndroidChannels();

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

    const label = reminder.label || 'Study Reminder';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${label}`,
        body: `Hey ${userName}! You have ${incompleteCount} ${incompleteCount === 1 ? 'study' : 'studies'} to complete. Keep going! 📚`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        ...(Platform.OS === 'android' && { channelId: REMINDER_CHANNEL_ID }),
        data: { type: 'reminder', reminderId: reminder.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: reminder.minute,
        ...(Platform.OS === 'android' && { channelId: REMINDER_CHANNEL_ID }),
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
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
      ...(Platform.OS === 'android' && { channelId: REWARD_CHANNEL_ID }),
    },
    trigger: null,
  });
}
