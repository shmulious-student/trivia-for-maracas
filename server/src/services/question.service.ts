import { Question } from '../models/Question';
import { shuffle } from '../utils/shuffle';
import mongoose from 'mongoose';

export class QuestionService {
    /**
     * Get random questions based on query and limit using Random Index method
     */
    static async getRandomQuestions(query: any, limit: number) {
        const random = Math.random();
        let questions = await Question.find({ ...query, random: { $gte: random } })
            .sort({ random: 1 })
            .limit(limit);

        if (questions.length < limit) {
            const remaining = limit - questions.length;
            const moreQuestions = await Question.find({ ...query, random: { $lt: random } })
                .sort({ random: 1 })
                .limit(remaining);
            questions = [...questions, ...moreQuestions];
        }
        return questions;
    }

    /**
     * Get questions for game, handling single or multiple subjects
     */
    static async getQuestionsForGame(subjectId: string | undefined, limit: number = 10) {
        let questions: any[] = [];
        // Cap limit to 50
        const limitNum = Math.min(limit, 50);

        if (subjectId && subjectId.includes(',')) {
            // Handle multiple subjects (Favorite Mix)
            // Filter out any non-ObjectId strings (like 'favorites-mix')
            const subjectIds = subjectId.split(',')
                .filter(id => mongoose.Types.ObjectId.isValid(id));

            if (subjectIds.length === 0) {
                return [];
            }

            const questionsPerSubject = Math.ceil(limitNum / subjectIds.length);

            const promises = subjectIds.map(id =>
                this.getRandomQuestions({ subjectId: id }, questionsPerSubject)
            );

            const results = await Promise.all(promises);
            questions = results.flat();

            // Shuffle the mixed questions
            questions = shuffle(questions);

            // Trim to exact limit
            if (questions.length > limitNum) {
                questions = questions.slice(0, limitNum);
            }

        } else {
            // Handle single subject or no subject
            const query = subjectId ? { subjectId } : {};
            questions = await this.getRandomQuestions(query, limitNum);
        }

        return questions;
    }
}
