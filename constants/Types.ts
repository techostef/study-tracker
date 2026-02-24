export interface Study {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  notes: string;
  target: number;
  progress: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface UserProfile {
  name: string;
}

export interface Reminder {
  id: string;
  hour: number;
  minute: number;
  enabled: boolean;
  label: string;
}

export interface Reward {
  id: string;
  studyId: string;
  studyTitle: string;
  completedAt: string;
}
