import { UserProfile, Gender, ActivityLevel, Goal } from './types';

// --- DEVELOPMENT CONFIGURATION ---
// DEV_MODE can be enabled to bypass Firebase authentication and use mock data
// for local frontend development without needing a running backend or internet connection.
export const DEV_MODE = false;

// --- MOCK DATA (Used when DEV_MODE is true) ---

// A mock Firebase User object to simulate a logged-in user.
export const mockUser = {
  uid: 'dev-user-01',
  email: 'dev@fittrack.ai',
  displayName: 'Dev User',
  photoURL: 'https://i.pravatar.cc/150?u=dev@fittrack.ai',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'mock',
  refreshToken: '',
  tenantId: null,
  delete: () => Promise.resolve(),
  getIdToken: () => Promise.resolve('mock-token'),
  getIdTokenResult: () => Promise.resolve({} as any),
  reload: () => Promise.resolve(),
  toJSON: () => ({}),
};


// A mock UserProfile object to pre-populate the app.
export const mockProfile: UserProfile = {
  name: 'Dev User',
  age: 30,
  weight: 75, // kg
  height: 180, // cm
  gender: Gender.MALE,
  activityLevel: ActivityLevel.MODERATE,
  goal: Goal.MAINTAIN,
  dailyGoals: {
    calories: 2500,
    protein: 150,
    carbs: 300,
    fat: 80,
    water: 2500, // ml
  },
  reminderSettings: {
    water: { enabled: true, frequency: 120 },
    meal: true,
    goalReached: true,
  },
};
