import request from 'supertest';
import express from 'express';
import leaderboardRoutes from '../leaderboard';
import authRoutes from '../auth';
import { User } from '../../models/User';
import { GameResult } from '../../models/GameResult';
import { Subject } from '../../models/Subject';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/auth', authRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_prod';

describe('Leaderboard Routes', () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
        // Create user and get token
        const user = await User.create({ username: 'testplayer' });
        userId = user._id.toString();
        token = jwt.sign({ id: userId, username: 'testplayer' }, JWT_SECRET);
    });

    describe('POST /api/leaderboard', () => {
        it('should submit a score with gameId', async () => {
            const gameId = 'game-1';
            const res = await request(app)
                .post('/api/leaderboard')
                .set('Authorization', `Bearer ${token}`)
                .send({ score: 100, gameId });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('score', 100);
            expect(res.body).toHaveProperty('gameId', gameId);
            expect(res.body.isNewRecord).toBe(true);
        });

        it('should handle duplicate submission (idempotency)', async () => {
            const gameId = 'game-2';

            // First submission
            await request(app)
                .post('/api/leaderboard')
                .set('Authorization', `Bearer ${token}`)
                .send({ score: 200, gameId });

            // Duplicate submission
            const res = await request(app)
                .post('/api/leaderboard')
                .set('Authorization', `Bearer ${token}`)
                .send({ score: 200, gameId });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('score', 200);
            expect(res.body).toHaveProperty('gameId', gameId);
            // isNewRecord might be false or true depending on implementation details of idempotency check
            // In our implementation, we return the existing result. 
            // If the existing result was a new record at the time, we might need to check.
            // But for now, let's just ensure it doesn't error and returns the result.
        });

        it('should require gameId', async () => {
            const res = await request(app)
                .post('/api/leaderboard')
                .set('Authorization', `Bearer ${token}`)
                .send({ score: 100 });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Missing gameId');
        });

        describe('GET /api/leaderboard', () => {
            it('should filter leaderboard by subject', async () => {
                // Create subjects
                const subject1 = await Subject.create({
                    name: { en: 'Math', he: 'Math' }
                });
                const subject2 = await Subject.create({
                    name: { en: 'History', he: 'History' }
                });

                // Create game results
                await GameResult.create({
                    userId,
                    username: 'testplayer',
                    score: 100,
                    subjectId: subject1._id,
                    gameId: 'game-1',
                    date: new Date()
                });

                await GameResult.create({
                    userId,
                    username: 'testplayer',
                    score: 200,
                    subjectId: subject2._id,
                    gameId: 'game-2',
                    date: new Date()
                });

                // Filter by subject 1
                const res1 = await request(app)
                    .get('/api/leaderboard')
                    .query({ subjectId: subject1._id.toString() });

                expect(res1.status).toBe(200);
                expect(res1.body).toHaveLength(1);
                expect(res1.body[0].score).toBe(100);
                expect(res1.body[0].subjectId).toBe(subject1._id.toString());

                // Filter by subject 2
                const res2 = await request(app)
                    .get('/api/leaderboard')
                    .query({ subjectId: subject2._id.toString() });

                expect(res2.status).toBe(200);
                expect(res2.body).toHaveLength(1);
                expect(res2.body[0].score).toBe(200);
                expect(res2.body[0].subjectId).toBe(subject2._id.toString());

                // No filter (should return all)
                const resAll = await request(app)
                    .get('/api/leaderboard');

                expect(resAll.status).toBe(200);
                expect(resAll.body).toHaveLength(2);
            });
        });
    });
});
