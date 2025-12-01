// Multilingual Text Support
export interface IMultilingualText {
    en: string;
    he: string;
    [key: string]: string; // Allow other languages in future
}

// Configuration Interfaces
export interface IGameConfig {
    questionCount: number;
    timerSeconds: number;
    isAgainstClock: boolean;
    minTimePerQuestion: number; // e.g., 5
    maxTimePerQuestion: number; // e.g., 60
}

export interface IAppConfig {
    defaultLanguage: 'he' | 'en';
    theme: 'dark' | 'light';
}

// Data Models
export interface ISubject {
    id: string;
    name: IMultilingualText;
    questionCount?: number; // Optional, populated by aggregation
}

export interface IQuestion {
    id: string;
    subjectId: string;
    text: IMultilingualText;
    answers: IMultilingualText[];
    correctAnswerIndex: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUser {
    id: string;
    username: string;
    avatarUrl?: string;
    isAdmin?: boolean;
    createdAt: Date;
}

export interface ILeaderboardEntry {
    userId: string;
    username: string;
    score: number;
    date: Date;
}
