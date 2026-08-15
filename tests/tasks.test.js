const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

describe('Task API', () => {
  describe('GET /tasks', () => {
    test('returns all tasks', async () => {
  taskService.create({ title: 'Task 1' });
  taskService.create({ title: 'Task 2' });

  const response = await request(app)
    .get('/tasks');

  expect(response.status).toBe(200);
  expect(response.body).toHaveLength(2);
  expect(response.body[0].title).toBe('Task 1');
  expect(response.body[1].title).toBe('Task 2');
});
    test('returns an empty array when there are no tasks', async () => {
      const response = await request(app)
        .get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
