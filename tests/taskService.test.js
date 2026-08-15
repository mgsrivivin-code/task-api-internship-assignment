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

  describe('getPaginated', () => {
    test('returns the requested number of tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });
      taskService.create({ title: 'Task 4' });

      const result = taskService.getPaginated(0, 2);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Task 1');
      expect(result[1].title).toBe('Task 2');
    });

    test('returns the next page of tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });
      taskService.create({ title: 'Task 4' });

      const result = taskService.getPaginated(1, 2);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Task 3');
      expect(result[1].title).toBe('Task 4');
    });

    test('returns an empty array when the page is beyond the available tasks', () => {
      taskService.create({ title: 'Task 1' });

      expect(taskService.getPaginated(5, 2)).toEqual([]);
    });
  });

  describe('getStats', () => {
    test('counts tasks by status', () => {
      taskService.create({ title: 'Todo 1', status: 'todo' });
      taskService.create({ title: 'Todo 2', status: 'todo' });
      taskService.create({ title: 'Progress', status: 'in_progress' });
      taskService.create({ title: 'Done', status: 'done' });

      const stats = taskService.getStats();

      expect(stats.todo).toBe(2);
      expect(stats.in_progress).toBe(1);
      expect(stats.done).toBe(1);
      expect(stats.overdue).toBe(0);
    });

    test('counts overdue incomplete tasks', () => {
      taskService.create({
        title: 'Overdue task',
        status: 'todo',
        dueDate: '2020-01-01T00:00:00.000Z',
      });

      const stats = taskService.getStats();

      expect(stats.overdue).toBe(1);
    });

    test('does not count completed overdue tasks as overdue', () => {
      taskService.create({
        title: 'Completed old task',
        status: 'done',
        dueDate: '2020-01-01T00:00:00.000Z',
      });

      const stats = taskService.getStats();

      expect(stats.done).toBe(1);
      expect(stats.overdue).toBe(0);
    });

    test('returns zero counts when there are no tasks', () => {
      expect(taskService.getStats()).toEqual({
        todo: 0,
        in_progress: 0,
        done: 0,
        overdue: 0,
      });
    });
  });
});