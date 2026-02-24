export interface LeaderboardEntry {
  rank: number;
  name: string;
  studiesCompleted: number;
  avatar: string;
  country: string;
}

export const fakeLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Sakura Tanaka', studiesCompleted: 156, avatar: '🧑‍🎓', country: '🇯🇵' },
  { rank: 2, name: 'Marcus Chen', studiesCompleted: 142, avatar: '👨‍💻', country: '🇸🇬' },
  { rank: 3, name: 'Elena Rodriguez', studiesCompleted: 138, avatar: '👩‍🔬', country: '🇪🇸' },
  { rank: 4, name: 'James Wilson', studiesCompleted: 125, avatar: '🧑‍🏫', country: '🇬🇧' },
  { rank: 5, name: 'Aisha Mohammed', studiesCompleted: 119, avatar: '👩‍💼', country: '🇦🇪' },
  { rank: 6, name: 'Kim Soo-jin', studiesCompleted: 112, avatar: '👨‍🎨', country: '🇰🇷' },
  { rank: 7, name: 'Pierre Dubois', studiesCompleted: 108, avatar: '🧑‍🔧', country: '🇫🇷' },
  { rank: 8, name: 'Priya Sharma', studiesCompleted: 95, avatar: '👩‍⚕️', country: '🇮🇳' },
  { rank: 9, name: 'Lucas Andersson', studiesCompleted: 89, avatar: '👨‍🚀', country: '🇸🇪' },
  { rank: 10, name: 'Maria Santos', studiesCompleted: 82, avatar: '👩‍🎓', country: '🇧🇷' },
  { rank: 11, name: "Tom O'Brien", studiesCompleted: 78, avatar: '🧑‍💻', country: '🇮🇪' },
  { rank: 12, name: 'Yuki Nakamura', studiesCompleted: 71, avatar: '👨‍🔬', country: '🇯🇵' },
  { rank: 13, name: 'Sofia Petrov', studiesCompleted: 65, avatar: '👩‍🏫', country: '🇷🇺' },
  { rank: 14, name: 'Daniel Müller', studiesCompleted: 58, avatar: '🧑‍🎨', country: '🇩🇪' },
  { rank: 15, name: 'Fatima Al-Rashid', studiesCompleted: 52, avatar: '👩‍💻', country: '🇸🇦' },
];

export const motivationalQuotes = [
  'The expert in anything was once a beginner.',
  'Learning is a treasure that will follow its owner everywhere.',
  'Study hard, for the well is deep, and our brains are shallow.',
  'The more that you read, the more things you will know.',
  'Education is the passport to the future.',
  'Success is the sum of small efforts repeated day in and day out.',
  'The beautiful thing about learning is that nobody can take it away from you.',
  "Don't let what you cannot do interfere with what you can do.",
  'The only way to do great work is to love what you do.',
  'Knowledge is power. Information is liberating.',
];
