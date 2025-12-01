import request from 'supertest';
import express from 'express';
import configRoutes from '../config';
import { Config } from '../../models/Config';

const app = express();
app.use(express.json());
app.use('/api/config', configRoutes);

describe('Config Routes', () => {
    describe('GET /api/config/game', () => {
        it('should return default game config when none exists', async () => {
            const res = await request(app).get('/api/config/game');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('questionTimer', 30);
        });

        it('should return stored game config', async () => {
            await Config.create({
                type: 'game',
                data: { questionTimer: 60, questionsPerGame: 20 }
            });

            const res = await request(app).get('/api/config/game');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('questionTimer', 60);
        });
    });
});
