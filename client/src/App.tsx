import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const API_BASE = 'https://todo-list-backend-gcyv.onrender.com'; // ✅ Add this at the top


  const fetchTodos = async () => {
    const res = await axios.get(`${API_BASE}/todos`);
    setTodos(res.data);
  };
  
  const addTodo = async () => {
    if (!title.trim()) return;
    const res = await axios.post(`${API_BASE}/todos`, { title });
    setTodos([...todos, res.data]);
    setTitle('');
  };
  
  const toggleTodo = async (id: number) => {
    const res = await axios.put(`${API_BASE}/todos/${id}`);
    setTodos(todos.map(todo => (todo.id === id ? res.data : todo)));
  };
  
  const deleteTodo = async (id: number) => {
    await axios.delete(`${API_BASE}/todos/${id}`);
    setTodos(todos.filter(todo => todo.id !== id));
  };
  

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="App">
      <h1>To-Do App</h1>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New task..." />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <span
              style={{ textDecoration: todo.completed ? 'line-through' : 'none', cursor: 'pointer' }}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
