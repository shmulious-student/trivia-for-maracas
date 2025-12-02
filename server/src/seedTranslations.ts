import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UITranslation } from './models/UITranslation';

dotenv.config();

const translations = [
    // Auth
    { key: 'auth.login', category: 'auth', text: { en: 'Login', he: 'התחברות' } },
    { key: 'auth.register', category: 'auth', text: { en: 'Register', he: 'הרשמה' } },
    { key: 'auth.username', category: 'auth', text: { en: 'Username', he: 'שם משתמש' } },
    { key: 'auth.password', category: 'auth', text: { en: 'Password', he: 'סיסמה' } },
    { key: 'auth.submit', category: 'auth', text: { en: 'Submit', he: 'שלח' } },
    { key: 'auth.logout', category: 'auth', text: { en: 'Logout', he: 'התנתק' } },

    // Lobby
    { key: 'lobby.title', category: 'game', text: { en: 'Welcome to Trivia!', he: 'ברוכים הבאים לטריוויה!' } },
    { key: 'lobby.subtitle', category: 'game', text: { en: 'Select a subject to start playing', he: 'בחר נושא כדי להתחיל לשחק' } },
    { key: 'lobby.selectSubject', category: 'game', text: { en: 'Select Subject', he: 'בחר נושא' } },
    { key: 'lobby.startGame', category: 'game', text: { en: 'Start Game', he: 'התחל משחק' } },
    { key: 'lobby.noQuestions', category: 'game', text: { en: 'No questions found for this subject.', he: 'לא נמצאו שאלות לנושא זה.' } },
    { key: 'lobby.startFailed', category: 'game', text: { en: 'Failed to start game.', he: 'שגיאה בהתחלת המשחק.' } },

    // Game
    { key: 'game.score', category: 'game', text: { en: 'Score', he: 'ניקוד' } },
    { key: 'game.question', category: 'game', text: { en: 'Question', he: 'שאלה' } },
    { key: 'game.next', category: 'game', text: { en: 'Next', he: 'הבא' } },

    // Result
    { key: 'result.gameOver', category: 'game', text: { en: 'Game Over!', he: 'המשחק נגמר!' } },
    { key: 'result.yourScore', category: 'game', text: { en: 'Your Score', he: 'הניקוד שלך' } },
    { key: 'result.goodTry', category: 'game', text: { en: 'Good Try!', he: 'ניסיון יפה!' } },
    { key: 'result.wellDone', category: 'game', text: { en: 'Well Done!', he: 'כל הכבוד!' } },
    { key: 'result.excellent', category: 'game', text: { en: 'Excellent!', he: 'מצוין!' } },
    { key: 'result.scoreSaved', category: 'game', text: { en: 'Score Saved!', he: 'הניקוד נשמר!' } },
    { key: 'result.playAgain', category: 'game', text: { en: 'Play Again', he: 'שחק שוב' } },
    { key: 'result.viewLeaderboard', category: 'game', text: { en: 'Leaderboard', he: 'טבלת מובילים' } },

    // Profile
    { key: 'profile.title', category: 'profile', text: { en: 'User Profile', he: 'פרופיל משתמש' } },
    { key: 'profile.changeAvatar', category: 'profile', text: { en: 'Change Avatar', he: 'שנה תמונה' } },
    { key: 'profile.username', category: 'profile', text: { en: 'Username', he: 'שם משתמש' } },
    { key: 'profile.avatarUpdated', category: 'profile', text: { en: 'Avatar updated successfully', he: 'התמונה עודכנה בהצלחה' } },
    { key: 'profile.uploadFailed', category: 'profile', text: { en: 'Failed to upload avatar', he: 'שגיאה בהעלאת התמונה' } },
    { key: 'profile.saved', category: 'profile', text: { en: 'Profile saved successfully', he: 'הפרופיל נשמר בהצלחה' } },
    { key: 'profile.saveFailed', category: 'profile', text: { en: 'Failed to save profile', he: 'שגיאה בשמירת הפרופיל' } },

    // Leaderboard
    { key: 'leaderboard.title', category: 'game', text: { en: 'Leaderboard', he: 'טבלת מובילים' } },
    { key: 'leaderboard.empty', category: 'game', text: { en: 'No scores yet. Be the first!', he: 'אין עדיין תוצאות. היה הראשון!' } },

    // Settings
    { key: 'settings.title', category: 'settings', text: { en: 'Settings', he: 'הגדרות' } },
    { key: 'settings.appearance', category: 'settings', text: { en: 'Appearance', he: 'מראה' } },
    { key: 'settings.darkMode', category: 'settings', text: { en: 'Dark Mode', he: 'מצב כהה' } },
    { key: 'settings.language', category: 'settings', text: { en: 'Language', he: 'שפה' } },

    // Common
    { key: 'common.loading', category: 'common', text: { en: 'Loading...', he: 'טוען...' } },
    { key: 'common.questions', category: 'common', text: { en: 'Questions', he: 'שאלות' } },
    { key: 'common.saving', category: 'common', text: { en: 'Saving...', he: 'שומר...' } },
    { key: 'common.save', category: 'common', text: { en: 'Save', he: 'שמור' } },
    { key: 'common.off', category: 'common', text: { en: 'Off', he: 'כבוי' } },
];

const seedTranslations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        await UITranslation.deleteMany({}); // Clear existing
        console.log('Cleared existing translations');

        await UITranslation.insertMany(translations);
        console.log('Seeded translations successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding translations:', error);
        process.exit(1);
    }
};

seedTranslations();
