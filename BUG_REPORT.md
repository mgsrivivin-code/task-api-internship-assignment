# Bug Report

## Bug 1: Status filter performs partial matching

### Expected behavior

The `GET /tasks?status=<status>` endpoint should filter tasks using an exact status match.

For example:

- `status=todo` should return tasks with status `todo`
- `status=in_progress` should return tasks with status `in_progress`
- `status=done` should return tasks with status `done`

A partial value such as `status=to` should not match a task whose status is `todo`.

### Actual behavior

The API returns a `todo` task when requesting:

`GET /tasks?status=to`

The response should be an empty array, but the API returns the task with status `todo`.

### How the bug was discovered

An integration test was added using Supertest to verify that partial status values do not match valid statuses.

The test sends:

`GET /tasks?status=to`

and expects:

```json
[]