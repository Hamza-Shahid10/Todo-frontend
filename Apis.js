import axios from "axios";

const API_URL = "https://todo-backend-5gdx.onrender.com/api/todos";

// Get all todos
export const getTodos = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Add new todo
export const addTodo = async (title) => {
  const res = await axios.post(API_URL, { title });
  return res.data;
};

// Toggle complete (update)
export const updateTodo = async (id, updatedData) => {
  const res = await axios.put(`${API_URL}/${id}`, updatedData);
  return res.data;
};

// Delete one todo
export const deleteTodo = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
