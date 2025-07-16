export type MatchStatus = 
  | 'waiting'    // En attente de démarrage
  | 'in_progress' // Match en cours
  | 'completed'  // Match terminé normalement
  | 'abandoned';  // Match abandonné

export interface MatchPlayer {
  userId: string;
  username: string;
  profilePicture?: string;
  score: number;
  correctAnswers: number;
  answers: {
    questionId: number;
    answerIndex: number;
    timeTaken: number;
    isCorrect: boolean;
  }[];
  abandoned: boolean;
}

export interface MatchQuestion {
  id: number;
  type: 'QCM' | 'VF' | 'Libre';
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface MatchDetails {
  _id: string;
  roomId: string;
  players: MatchPlayer[];
  questions: MatchQuestion[];
  status: MatchStatus;
  theme: string;
  startedAt: Date;
  completedAt?: Date;
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeData {
  theme: string;
  questionCount: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface MatchResult {
  players: {
    [playerId: string]: {
      score: number;
      correctAnswers: number;
    };
  };
  winner?: string;
}