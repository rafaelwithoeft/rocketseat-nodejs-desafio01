const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

/**
 * Check if user exists.
 * @param {Request} request
 * @param {Response} response
 * @param {function} next
 */
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }

  request.user = user;
  next();
}

/**
 * Create new user.
 */
app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (users.some((user) => user.username === username)) {
    return response.status(400).json({ error: "User already exists." });
  }

  const newUser = { id: uuidv4(), name, username, todos: [] };
  users.push(newUser);

  return response.status(201).json(newUser);
});

/**
 * Get user's TODO.
 */
app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(201).json(user.todos);
});

/**
 * Create new TODO.
 */
app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

/**
 * Update one TODO.
 */
app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "TODO not found." });
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);
});

/**
 * Update status of a TODO
 */
app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "TODO not found." });
  }
  todo.done = true;

  return response.status(201).json(todo);
});

/**
 * Delete one TODO.
 */
app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "TODO not found." });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;
