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
    description?: IMultilingualText;
    questionCount?: number; // Optional, populated by aggregation
    lastReport?: string;
    coverImage?: string;
}

export interface IQuestionOption {
    text: IMultilingualText;
}

export interface IQuestion {
    id: string;
    subjectId?: string; // Optional for now
    text: IMultilingualText;
    options: IQuestionOption[];
    correctAnswerIndex: number;
    type: 'multiple-choice' | 'boolean';
    sourceUrl?: string;
    sourceQuote?: string;
    random?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUser {
    id: string;
    username: string;
    password?: string; // Only for admins
    avatarUrl?: string;
    isAdmin?: boolean;
    preferences?: {
        questionsPerTournament?: number;
        gameTimer?: number;
        isTimerEnabled?: boolean;
        favoriteSubjects?: string[];
        gender?: 'male' | 'female' | 'other';
        language?: 'en' | 'he';
        hasSeenBonusModal?: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

export enum GameStatus {
    Lobby = 'lobby',
    Playing = 'playing',
    Result = 'result'
}

export interface IGameState {
    status: GameStatus;
    currentQuestionIndex: number;
    score: number;
    answers: Record<string, number>; // questionId -> answerIndex
}

export interface ILeaderboardEntry {
    userId: string;
    username: string;
    avatarUrl?: string;
    score: number;
    subjectId?: string;
    subjectName?: IMultilingualText;
    gameId?: string;
    date: Date;
}

export interface IUITranslation {
    id?: string;
    key: string; // e.g., "login.welcome"
    text: IMultilingualText;
    category: string; // e.g., "auth", "game", "admin"
}

export interface IImportData {
    subjects: ISubject[];
    questions: IQuestion[];
}
