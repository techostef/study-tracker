import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Study, Category, UserProfile, Reminder, Reward } from '@/constants/Types';
import { formatDateToString, getYesterday } from './date';

const KEYS = {
  STUDIES: 'adventure_study_studies',
  HISTORY_STUDIES: 'adventure_study_history_studies',
  CATEGORIES: 'adventure_study_categories',
  PROFILE: 'adventure_study_profile',
  REMINDERS: 'adventure_study_reminders',
  REWARDS: 'adventure_study_rewards',
  CURRENT_DATE: 'adventure_study_current_date',
};

async function load<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

async function save<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const loadStudies = () => load<Study[]>(KEYS.STUDIES, []);
export const saveStudies = (studies: Study[]) => save(KEYS.STUDIES, studies);

export const loadHistoryStudies = () => load<Record<string, Study[]>>(KEYS.HISTORY_STUDIES, {});
export const saveHistoryStudies = (studies: Record<string, Study[]>) => save(KEYS.HISTORY_STUDIES, studies);

export const loadCategories = () => load<Category[]>(KEYS.CATEGORIES, []);
export const saveCategories = (categories: Category[]) => save(KEYS.CATEGORIES, categories);

export const loadProfile = () => load<UserProfile>(KEYS.PROFILE, { name: 'Adventurer' });
export const saveProfile = (profile: UserProfile) => save(KEYS.PROFILE, profile);

export const loadReminders = () => load<Reminder[]>(KEYS.REMINDERS, []);
export const saveReminders = (reminders: Reminder[]) => save(KEYS.REMINDERS, reminders);

export const loadRewards = () => load<Reward[]>(KEYS.REWARDS, []);
export const saveRewards = (rewards: Reward[]) => save(KEYS.REWARDS, rewards);

export const loadCurrentDate = () => load<string>(KEYS.CURRENT_DATE, formatDateToString(getYesterday(), 'yyyy-MM-dd'));
export const saveCurrentDate = (date: Date) => save(KEYS.CURRENT_DATE, formatDateToString(date, 'yyyy-MM-dd'));

export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

export interface ExportData {
  version: number;
  exportedAt: string;
  profile: UserProfile;
  studies: Study[];
  historyStudies: Record<string, Study[]>;
  categories: Category[];
  reminders: Reminder[];
  rewards: Reward[];
}

export async function exportData(): Promise<void> {
  const [studies, historyStudies, categories, profile, reminders, rewards] = await Promise.all([
    loadStudies(),
    loadHistoryStudies(),
    loadCategories(),
    loadProfile(),
    loadReminders(),
    loadRewards(),
    loadCurrentDate(),
  ]);

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    studies,
    historyStudies,
    categories,
    reminders,
    rewards,
  };

  const json = JSON.stringify(data, null, 2);
  const fileName = `study-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  const fileUri = (FileSystem.cacheDirectory ?? '') + fileName;

  await FileSystem.writeAsStringAsync(fileUri, json);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Export Study Tracker Data',
    UTI: 'public.json',
  });
}

export async function importData(): Promise<ExportData> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    throw new Error('CANCELLED');
  }

  const asset = result.assets[0];
  const json = await FileSystem.readAsStringAsync(asset.uri);

  let parsed: ExportData;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid file: not valid JSON');
  }

  if (!parsed.version || !parsed.studies || !parsed.categories) {
    throw new Error('Invalid file: missing required fields');
  }

  await Promise.all([
    saveStudies(parsed.studies ?? []),
    saveCategories(parsed.categories ?? []),
    saveProfile(parsed.profile ?? { name: 'Adventurer' }),
    saveReminders(parsed.reminders ?? []),
    saveRewards(parsed.rewards ?? []),
  ]);

  return parsed;
}
