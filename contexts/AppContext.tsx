import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Study, Category, UserProfile, Reminder, Reward } from '@/constants/Types';
import * as Storage from '@/utils/storage';
import {
  scheduleReminders,
  sendRewardNotification,
  requestNotificationPermissions,
} from '@/utils/notifications';

interface AppContextType {
  studies: Study[];
  categories: Category[];
  profile: UserProfile;
  reminders: Reminder[];
  rewards: Reward[];
  isLoading: boolean;

  addStudy: (study: Omit<Study, 'id' | 'progress' | 'completed' | 'createdAt'>) => Promise<void>;
  updateStudy: (study: Study) => Promise<void>;
  deleteStudy: (id: string) => Promise<void>;
  incrementProgress: (id: string) => Promise<boolean>;

  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  updateProfile: (profile: UserProfile) => Promise<void>;

  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  updateReminder: (reminder: Reminder) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [studies, setStudies] = useState<Study[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ name: 'Adventurer' });
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, c, p, rm, rw] = await Promise.all([
        Storage.loadStudies(),
        Storage.loadCategories(),
        Storage.loadProfile(),
        Storage.loadReminders(),
        Storage.loadRewards(),
      ]);
      setStudies(s);
      setCategories(c);
      setProfile(p);
      setReminders(rm);
      setRewards(rw);
      setIsLoading(false);

      await requestNotificationPermissions();
      const incompleteCount = s.filter((st) => !st.completed).length;
      await scheduleReminders(rm, incompleteCount, p.name);
    })();
  }, []);

  const refreshReminders = useCallback(
    async (
      currentStudies: Study[],
      currentReminders: Reminder[],
      currentProfile: UserProfile
    ) => {
      const incompleteCount = currentStudies.filter((s) => !s.completed).length;
      await scheduleReminders(currentReminders, incompleteCount, currentProfile.name);
    },
    []
  );

  const addStudy = useCallback(
    async (data: Omit<Study, 'id' | 'progress' | 'completed' | 'createdAt'>) => {
      const newStudy: Study = {
        ...data,
        id: Storage.generateId(),
        progress: 0,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      const updated = [...studies, newStudy];
      setStudies(updated);
      await Storage.saveStudies(updated);
      await refreshReminders(updated, reminders, profile);
    },
    [studies, reminders, profile, refreshReminders]
  );

  const updateStudy = useCallback(
    async (study: Study) => {
      const updated = studies.map((s) => (s.id === study.id ? study : s));
      setStudies(updated);
      await Storage.saveStudies(updated);
      await refreshReminders(updated, reminders, profile);
    },
    [studies, reminders, profile, refreshReminders]
  );

  const deleteStudy = useCallback(
    async (id: string) => {
      const updated = studies.filter((s) => s.id !== id);
      setStudies(updated);
      await Storage.saveStudies(updated);
      const updatedRewards = rewards.filter((r) => r.studyId !== id);
      setRewards(updatedRewards);
      await Storage.saveRewards(updatedRewards);
      await refreshReminders(updated, reminders, profile);
    },
    [studies, rewards, reminders, profile, refreshReminders]
  );

  const incrementProgress = useCallback(
    async (id: string): Promise<boolean> => {
      let justCompleted = false;
      const updated = studies.map((s) => {
        if (s.id !== id || s.completed) return s;
        const newProgress = s.progress + 1;
        const completed = newProgress >= s.target;
        if (completed) justCompleted = true;
        return {
          ...s,
          progress: newProgress,
          completed,
          completedAt: completed ? new Date().toISOString() : undefined,
        };
      });
      setStudies(updated);
      await Storage.saveStudies(updated);

      if (justCompleted) {
        const completedStudy = updated.find((s) => s.id === id)!;
        const newReward: Reward = {
          id: Storage.generateId(),
          studyId: id,
          studyTitle: completedStudy.title,
          completedAt: new Date().toISOString(),
        };
        const updatedRewards = [...rewards, newReward];
        setRewards(updatedRewards);
        await Storage.saveRewards(updatedRewards);
        await sendRewardNotification(completedStudy.title, profile.name);
      }

      await refreshReminders(updated, reminders, profile);
      return justCompleted;
    },
    [studies, rewards, reminders, profile, refreshReminders]
  );

  const addCategory = useCallback(
    async (data: Omit<Category, 'id'>) => {
      const newCategory: Category = { ...data, id: Storage.generateId() };
      const updated = [...categories, newCategory];
      setCategories(updated);
      await Storage.saveCategories(updated);
    },
    [categories]
  );

  const updateCategory = useCallback(
    async (category: Category) => {
      const updated = categories.map((c) => (c.id === category.id ? category : c));
      setCategories(updated);
      await Storage.saveCategories(updated);
    },
    [categories]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      await Storage.saveCategories(updated);
    },
    [categories]
  );

  const updateProfileFn = useCallback(
    async (newProfile: UserProfile) => {
      setProfile(newProfile);
      await Storage.saveProfile(newProfile);
      await refreshReminders(studies, reminders, newProfile);
    },
    [studies, reminders, refreshReminders]
  );

  const addReminder = useCallback(
    async (data: Omit<Reminder, 'id'>) => {
      const newReminder: Reminder = { ...data, id: Storage.generateId() };
      const updated = [...reminders, newReminder];
      setReminders(updated);
      await Storage.saveReminders(updated);
      await refreshReminders(studies, updated, profile);
    },
    [reminders, studies, profile, refreshReminders]
  );

  const updateReminder = useCallback(
    async (reminder: Reminder) => {
      const updated = reminders.map((r) => (r.id === reminder.id ? reminder : r));
      setReminders(updated);
      await Storage.saveReminders(updated);
      await refreshReminders(studies, updated, profile);
    },
    [reminders, studies, profile, refreshReminders]
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      const updated = reminders.filter((r) => r.id !== id);
      setReminders(updated);
      await Storage.saveReminders(updated);
      await refreshReminders(studies, updated, profile);
    },
    [reminders, studies, profile, refreshReminders]
  );

  return (
    <AppContext.Provider
      value={{
        studies,
        categories,
        profile,
        reminders,
        rewards,
        isLoading,
        addStudy,
        updateStudy,
        deleteStudy,
        incrementProgress,
        addCategory,
        updateCategory,
        deleteCategory,
        updateProfile: updateProfileFn,
        addReminder,
        updateReminder,
        deleteReminder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
