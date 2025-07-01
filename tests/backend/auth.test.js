require('dotenv').config({ path: './backend/.env.test' });

const request = require('supertest');
const { connectTestDB, disconnectTestDB } = require('../../backend/src/database/mongoMemory');
const app = require('../../backend/app');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe('🧪 Autenticación', () => {
  test('Registro exitoso', async () => {
    const res = await request(app).post('/api/register').send({
      nombreUsuario: 'testUser',
      contraseña: 'testPass123'
    });

    console.log('🔍 Registro:', res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  test('Login exitoso', async () => {
    const res = await request(app).post('/api/login').send({
      nombreUsuario: 'testUser',
      contraseña: 'testPass123'
    });

    console.log('🔍 Login:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
