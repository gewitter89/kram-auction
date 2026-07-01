const request = require('supertest');
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';
process.env.DB_TYPE = 'sqlite';
process.env.DATA_DIR = require('path').join(__dirname, '..');

const app = require('../server');

describe('API Tests', () => {
    let token;
    const testUser = { username: 'testuser_' + Date.now(), email: 'test' + Date.now() + '@test.com', password: 'test12345678' };

    test('GET /api/categories returns 200', async () => {
        const res = await request(app).get('/api/categories');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /api/auth/register creates user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeDefined();
        token = res.body.token;
    });

    test('POST /api/auth/login blocked without email verification', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ login: testUser.username, password: testUser.password });
        expect(res.statusCode).toBe(403);
    });

    test('POST /api/auth/login works after email verification', async () => {
        const db = require('../database');
        const user = await db.prepare('SELECT email_token FROM users WHERE username = ?').get(testUser.username);
        if (user?.email_token) {
            await request(app).get('/api/auth/verify-email?token=' + user.email_token);
        }
        const res = await request(app)
            .post('/api/auth/login')
            .send({ login: testUser.username, password: testUser.password });
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test('GET /api/lots returns array', async () => {
        const res = await request(app).get('/api/lots');
        expect(res.statusCode).toBe(200);
    });

    test('POST /api/lots requires auth', async () => {
        const res = await request(app).post('/api/lots');
        expect(res.statusCode).toBe(401);
    });
});
