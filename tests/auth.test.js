import { jest } from '@jest/globals';
import request from 'supertest';

// Mock the database module
jest.unstable_mockModule('../db.js', () => ({
    default: {
        query: jest.fn(),
        connect: jest.fn(),
        on: jest.fn(),
    },
    connectDB: jest.fn(),
}));

// Import the app dynamically after mocking
const { default: app } = await import('../index.js');

describe('Auth Routes', () => {

    test('GET /login should render login page', async () => {
        const res = await request(app).get('/login');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Login');
    });

    test('GET /register should render register page', async () => {
        const res = await request(app).get('/register');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Register');
    });

});
