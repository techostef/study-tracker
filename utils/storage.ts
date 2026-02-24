import AsyncStorage from '@react-native-async-storage/async-storage';
import { Study, Category, UserProfile, Reminder, Reward } from '@/constants/Types';

const KEYS = {
  STUDIES: 'adventure_study_studies',
  CATEGORIES: 'adventure_study_categories',
  PROFILE: 'adventure_study_profile',
  REMINDERS: 'adventure_study_reminders',
  REWARDS: 'adventure_study_rewards',
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

export const loadCategories = () => load<Category[]>(KEYS.CATEGORIES, []);
export const saveCategories = (categories: Category[]) => save(KEYS.CATEGORIES, categories);

export const loadProfile = () => load<UserProfile>(KEYS.PROFILE, { name: 'Adventurer' });
export const saveProfile = (profile: UserProfile) => save(KEYS.PROFILE, profile);

export const loadReminders = () => load<Reminder[]>(KEYS.REMINDERS, []);
export const saveReminders = (reminders: Reminder[]) => save(KEYS.REMINDERS, reminders);

export const loadRewards = () => load<Reward[]>(KEYS.REWARDS, []);
export const saveRewards = (rewards: Reward[]) => save(KEYS.REWARDS, rewards);

export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
