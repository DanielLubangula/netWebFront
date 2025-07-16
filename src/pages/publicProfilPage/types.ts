export interface Rank {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface Player {
  userId: string;
  username: string;
  profilePicture: string;
  score: number;
  correctAnswers: number;
  abandoned: boolean;
}

// Exemple de type simplifié
export interface Match {
  _id: string;
  roomId: string;
  players: {
    userId: string;
    username: string;
    profilePicture: string;
    score: number;
    abandoned: boolean;
  }[];
  winner: string;
  theme: string;
  completedAt?: string;
  startedAt?: string;
}


export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  gamesPlayed: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
  rank: Rank;
  matches?: Match[];
}