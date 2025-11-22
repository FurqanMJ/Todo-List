import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  due_date?: string;
  priority: 'Low' | 'Medium' | 'High';
}

const App: React.FC = () => {
  const API_BASE = 'https://todo-list-backend-gcyv.onrender.com';

  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done' | 'overdue'>('all');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/`); // 🔥 wakes Render server
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await axios.get(`${API_BASE}/todos`);
    setTodos(res.data);
  };

  const addTodo = async () => {
    if (!title.trim()) return;
    const res = await axios.post(`${API_BASE}/todos`, {
      title,
      due_date: dueDate || null,
      priority,
      completed: false,
    });
    setTodos([...todos, res.data]);
    setTitle('');
    setDueDate('');
    setPriority('Medium');
  };

  const toggleTodo = async (id: number) => {
    try {
      const res = await axios.put(`${API_BASE}/todos/${id}/toggle`);
      setTodos(todos.map(todo => (todo.id === id ? res.data : todo)));
    } catch (err) {
      console.error('Error toggling todo:', err);
      alert('Failed to toggle task.');
    }
  };

  const deleteTodo = async (id: number) => {
    await axios.delete(`${API_BASE}/todos/${id}`);
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const isOverdue = (todo: Todo) =>
    todo.due_date &&
    !todo.completed &&
    dayjs(todo.due_date).isSameOrBefore(dayjs(), 'day');
  

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    

    switch (filter) {
      case 'active': return !todo.completed && matchesSearch;
      case 'done': return todo.completed && matchesSearch;
      case 'overdue': return isOverdue(todo) && matchesSearch;
      default: return matchesSearch;
    }
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
    overdue: todos.filter(t => isOverdue(t)).length,
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} min-h-screen p-6 transition`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          <img src="/icon.svg" alt="TaskMaster Logo" className="w-8 h-8 rounded-md" />
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">TaskMaster</h1>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className="text-xl hover:scale-110 transition">
          {darkMode ? '🌞' : '🌙'}
        </button>
      </div>

      {/* Subtitle */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-500 dark:text-gray-300 mb-6">
        Organize your life, one task at a time
      </h1>

      {/* Stats */}
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-4xl px-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={stats.total} darkMode={darkMode} />
        <StatCard label="Completed" value={stats.completed} color="text-green-500 dark:text-green-400" darkMode={darkMode} />
        <StatCard label="Active" value={stats.active} darkMode={darkMode} />
        <StatCard label="Overdue" value={stats.overdue} color="text-red-500 dark:text-red-400" darkMode={darkMode} />


        </div>
      </div>

      {/* Add Task */}
      <div className="flex justify-center">
        <div className="w-full max-w-4xl px-4">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} border rounded-lg p-4 mb-6 shadow-sm dark:border-gray-700`}>
          <h2 className={`font-semibold text-lg mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>+ Add New Task</h2>



          <div className="mb-3">
              <input
                className={`p-2 border rounded w-full placeholder-gray-400 transition 
                  ${darkMode ? 'bg-gray-900 text-white border-gray-600' : 'bg-white border-gray-300'}`}
                placeholder="What needs to be done?"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <input
                type="date"
                min={dayjs().format('YYYY-MM-DD')}
                className={`p-2 border rounded text-sm w-full transition 
                  ${darkMode ? 'bg-gray-900 text-white border-gray-600' : 'bg-white border-gray-300 text-gray-600'}`}
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
              <div className="flex justify-start space-x-2">
                {['Low', 'Medium', 'High'].map(level => {
                  const icon = level === 'Low' ? '🟢' : level === 'Medium' ? '🟡' : '🔴';
                  const selected =
                    priority === level
                      ? `${level === 'Low' ? 'bg-green-100 text-green-600' : level === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'} dark:bg-opacity-80`
                      : darkMode ? 'text-white border-gray-600' : 'text-gray-600 border-gray-300';
                  return (
                    <button
                      key={level}
                      className={`px-3 py-1 rounded border hover:opacity-80 transition ${selected}`}
                      onClick={() => setPriority(level as any)}
                    >
                      {icon} {level}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={addTodo}
                  className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition w-full md:w-auto"
                >
                  + Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-center mb-4">
        <div className="w-full max-w-4xl px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <input
            className={`border p-2 rounded w-full md:w-1/3 placeholder-gray-400 transition
              ${darkMode ? 'bg-gray-900 text-white border-gray-600' : 'bg-white border-gray-300 text-gray-700'}`}
            placeholder="🔍 Search your tasks..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="flex space-x-2">
            {['all', 'active', 'done', 'overdue'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1 rounded-full border text-sm transition
                  ${filter === f
                    ? 'bg-blue-100 dark:bg-blue-600 text-blue-600 dark:text-white font-semibold'
                    : `${darkMode ? 'text-gray-300 border-gray-600' : 'text-gray-600 border-gray-300'}`}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} <span className="font-bold">{stats[f as keyof typeof stats]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex justify-center">
        <div className="w-full max-w-4xl px-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border rounded-lg p-4 shadow-sm dark:border-gray-700`}>
            {filteredTodos.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-300 py-8 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4 -4m6 2a9 9 0 11-18 0a9 9 0 0118 0z" />
                </svg>
                You're all caught up! Add a new task to get started.
              </div>
            ) : (
              <ul className="space-y-3">
                {[...filteredTodos]
                  .sort((a, b) => {
                    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  })
                  .map(todo => (

                  <li
                    key={todo.id}
                    className={`border p-4 rounded-lg flex justify-between items-center shadow-sm transition 
                      ${isOverdue(todo) && !todo.completed
                        ? 'bg-red-50 border-red-300 text-red-800'
                        : darkMode
                          ? 'bg-gray-900 text-white border-gray-700'
                          : 'bg-white text-gray-800 border-gray-300'}
                       
                      ${todo.completed ? 'opacity-50 line-through' : ''}`}
                  >
                    <div>
                      <div className="text-base font-medium">{todo.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                      {todo.due_date && (
  <div className={`flex items-center gap-1 ${isOverdue(todo) ? 'text-red-600' : 'text-gray-500 dark:text-gray-300'}`}>
    {isOverdue(todo) ? '🕒 Overdue:' : '📅 Due:'} {dayjs(todo.due_date).format('MMM D, YYYY')}
  </div>
)}

                        <span className="inline-flex items-center gap-1">
                          {todo.priority === 'Low' && '🟢'}
                          {todo.priority === 'Medium' && '🟡'}
                          {todo.priority === 'High' && '🔴'}
                          {todo.priority} Priority
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleTodo(todo.id)} className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-300 transition">✔</button>
                      <button onClick={() => deleteTodo(todo.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition">🗑</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  color = 'text-blue-600 dark:text-blue-400',
  darkMode,
}: {
  label: string;
  value: number;
  color?: string;
  darkMode: boolean;
}) => (
  <div
    className={`${
      darkMode
        ? 'bg-gray-800 border-gray-700 text-white'
        : 'bg-white border-gray-200 text-gray-800'
    } border rounded-lg p-4 shadow-sm text-center hover:shadow-md transition`}
  >
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{label}</div>
  </div>
);




export default App;
