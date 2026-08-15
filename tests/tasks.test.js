const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

describe('Task API', () => {
  describe('GET /tasks', () => {
    test('returns an empty array when there are no tasks', async () => {
      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('returns all tasks', async () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const response = await request(app).get('/tasks');

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

    test('does not return tasks for a partial status value', async () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      const response = await request(app)
        .get('/tasks')
        .query({ status: 'to' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /tasks pagination', () => {
    test('returns paginated tasks', async () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });
      taskService.create({ title: 'Task 4' });

      const response = await request(app)
        .get('/tasks')
        .query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('returns an empty array when page exceeds available tasks', async () => {
      taskService.create({ title: 'Task 1' });

      const response = await request(app)
        .get('/tasks')
        .query({ page: 10, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /tasks', () => {
    test('creates a task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'New Task',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('New Task');
      expect(response.body.status).toBe('todo');
      expect(response.body.priority).toBe('medium');
      expect(response.body.completedAt).toBeNull();
      expect(response.body.id).toEqual(expect.any(String));
      expect(response.body.createdAt).toEqual(expect.any(String));
    });

    test('returns 400 when title is missing', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('returns 400 for invalid priority', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Task',
          priority: 'urgent',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /tasks/:id', () => {
    test('updates an existing task', async () => {
      const task = taskService.create({
        title: 'Old Title',
      });

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
          title: 'New Title',
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('New Title');
      expect(response.body.id).toBe(task.id);
    });

    test('returns 404 for a missing task', async () => {
      const response = await request(app)
        .put('/tasks/missing-id')
        .send({
          title: 'New Title',
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Task not found',
      });
    });
  });

  describe('DELETE /tasks/:id', () => {
    test('deletes an existing task', async () => {
      const task = taskService.create({
        title: 'Delete Me',
      });

      const response = await request(app)
        .delete(`/tasks/${task.id}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      expect(taskService.findById(task.id)).toBeUndefined();
    });

    test('returns 404 for a missing task', async () => {
      const response = await request(app)
        .delete('/tasks/missing-id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Task not found',
      });
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    test('marks a task as complete', async () => {
      const task = taskService.create({
        title: 'Finish Me',
        priority: 'high',
      });

      const response = await request(app)
        .patch(`/tasks/${task.id}/complete`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('done');
      expect(response.body.completedAt).not.toBeNull();
      expect(response.body.priority).toBe('medium');
    });

    test('returns 404 for a missing task', async () => {
      const response = await request(app)
        .patch('/tasks/missing-id/complete');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Task not found',
      });
    });
  });

  describe('GET /tasks/stats', () => {
    test('returns task statistics', async () => {
      taskService.create({
        title: 'Todo',
        status: 'todo',
      });

      taskService.create({
        title: 'Done',
        status: 'done',
      });

      const response = await request(app)
        .get('/tasks/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        todo: 1,
        in_progress: 0,
        done: 1,
        overdue: 0,
      });
    });
  });
});