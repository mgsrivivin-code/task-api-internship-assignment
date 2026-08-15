const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('create', () => {
    test('creates a task with default values', () => {
      const task = taskService.create({ title: 'Test task' });

      expect(task).toMatchObject({
        title: 'Test task',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        completedAt: null,
      });

      expect(task.id).toEqual(expect.any(String));
      expect(task.createdAt).toEqual(expect.any(String));
    });

    test('creates a task with supplied values', () => {
      const task = taskService.create({
        title: 'Important task',
        description: 'Test description',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-08-20T10:00:00.000Z',
      });

      expect(task).toMatchObject({
        title: 'Important task',
        description: 'Test description',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-08-20T10:00:00.000Z',
      });
    });
  });

  describe('getAll', () => {
    test('returns all tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const tasks = taskService.getAll();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');
    });

    test('returns an empty array when there are no tasks', () => {
      expect(taskService.getAll()).toEqual([]);
    });
  });

  describe('findById', () => {
    test('returns the task when the ID exists', () => {
      const created = taskService.create({ title: 'Find me' });

      expect(taskService.findById(created.id)).toEqual(created);
    });

    test('returns undefined for a non-existent ID', () => {
      expect(taskService.findById('does-not-exist')).toBeUndefined();
    });
  });

  describe('getByStatus', () => {
    test('returns tasks matching the status', () => {
      taskService.create({ title: 'Todo task', status: 'todo' });
      taskService.create({ title: 'Done task', status: 'done' });

      const result = taskService.getByStatus('todo');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Todo task');
    });

    test('returns an empty array when no tasks match', () => {
      taskService.create({ title: 'Todo task', status: 'todo' });

      expect(taskService.getByStatus('done')).toEqual([]);
    });
  });

  describe('update', () => {
    test('updates an existing task', () => {
      const task = taskService.create({ title: 'Old title' });

      const updated = taskService.update(task.id, {
        title: 'New title',
        priority: 'high',
      });

      expect(updated).toMatchObject({
        id: task.id,
        title: 'New title',
        priority: 'high',
      });
    });

    test('returns null for a non-existent task', () => {
      expect(
        taskService.update('does-not-exist', { title: 'New title' })
      ).toBeNull();
    });
  });

  describe('remove', () => {
    test('removes an existing task', () => {
      const task = taskService.create({ title: 'Delete me' });

      expect(taskService.remove(task.id)).toBe(true);
      expect(taskService.findById(task.id)).toBeUndefined();
    });

    test('returns false for a non-existent task', () => {
      expect(taskService.remove('does-not-exist')).toBe(false);
    });
  });

  describe('completeTask', () => {
    test('marks a task as done', () => {
      const task = taskService.create({
        title: 'Complete me',
        priority: 'high',
      });

      const completed = taskService.completeTask(task.id);

      expect(completed.status).toBe('done');
      expect(completed.priority).toBe('medium');
      expect(completed.completedAt).toEqual(expect.any(String));
    });

    test('returns null for a non-existent task', () => {
      expect(taskService.completeTask('does-not-exist')).toBeNull();
    });
  });
});