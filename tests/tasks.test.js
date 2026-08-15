const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

describe('Task API', () => {
  describe('GET /tasks', () => {
    test('returns an empty array when there are no tasks', async () => {
      const response = await request(app)
        .get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
