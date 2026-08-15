const express = require('express');
const taskService = require('../services/taskService');
const {
  validateCreateTask,
  validateUpdateTask,
} = require('../utils/validators');

const router = express.Router();


router.get('/', (req, res) => {
  const { status, page, limit } = req.query;

  if (status !== undefined) {
    return res.status(200).json(taskService.getByStatus(status));
  }

  if (page !== undefined || limit !== undefined) {
    const pageNumber = Number(page || 0);
    const limitNumber = Number(limit || 10);

    return res
      .status(200)
      .json(taskService.getPaginated(pageNumber, limitNumber));
  }

  return res.status(200).json(taskService.getAll());
});


router.post('/', (req, res) => {
  const error = validateCreateTask(req.body);

  if (error) {
    return res.status(400).json({
      error,
    });
  }

  const task = taskService.create(req.body);

  return res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const error = validateUpdateTask(req.body);

  if (error) {
    return res.status(400).json({
      error,
    });
  }

  const task = taskService.update(req.params.id, req.body);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found',
    });
  }

  return res.status(200).json(task);
});

router.delete('/:id', (req, res) => {
  const removed = taskService.remove(req.params.id);

  if (!removed) {
    return res.status(404).json({
      error: 'Task not found',
    });
  }

  return res.status(204).send();
});

router.patch('/:id/complete', (req, res) => {
  const task = taskService.completeTask(req.params.id);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found',
    });
  }

  return res.status(200).json(task);
});

router.patch('/:id/assign', (req, res) => {
  const { assignee } = req.body;

  if (typeof assignee !== 'string' || assignee.trim() === '') {
    return res.status(400).json({
      error: 'Assignee must be a non-empty string',
    });
  }

  const task = taskService.assignTask(
    req.params.id,
    assignee.trim()
  );

  if (!task) {
    return res.status(404).json({
      error: 'Task not found',
    });
  }

  return res.status(200).json(task);
});

router.get('/stats', (req, res) => {
  return res.status(200).json(taskService.getStats());
});

module.exports = router;