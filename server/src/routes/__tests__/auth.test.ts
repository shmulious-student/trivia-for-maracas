import request from 'supertest';
import express from 'express';
import authRoutes from '../auth';
import { User } from '../../models/User';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser' });

            expect(res.status).toBe(200);
            expect(res.body.user).toHaveProperty('username', 'testuser');
            expect(res.body).toHaveProperty('token');
        });

        it('should return existing user if username exists', async () => {
            await User.create({ username: 'existinguser' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'existinguser' });

            expect(res.status).toBe(200);
            expect(res.body.user).toHaveProperty('username', 'existinguser');
        });

        it('should fail without username', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({});

            expect(res.status).toBe(400);
        });
    });
});
