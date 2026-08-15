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
  });

  describe('GET /tasks?status=todo', () => {
    test('returns only tasks with the requested status', async () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      taskService.create({
        title: 'Done task',
        status: 'done',
      });

      const response = await request(app)
        .get('/tasks')
        .query({ status: 'todo' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Todo task');
      expect(response.body[0].status).toBe('todo');
    });

    test('returns an empty array when no tasks match the status', async () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      const response = await request(app)
        .get('/tasks')
        .query({ status: 'done' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
