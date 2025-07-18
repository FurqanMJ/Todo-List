import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // only for Render
  
});


app.use(cors({
  origin: 'https://todo-list-frontend-n2ya.onrender.com',
  credentials: true
}));
app.use(express.json());

/**
 * GET /todos
 * Optional query: ?search=keyword
 */
app.get('/todos', async (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM todos';
  const values: any[] = [];

  if (search) {
    query += ' WHERE LOWER(title) LIKE $1';
    values.push(`%${(search as string).toLowerCase()}%`);
  }

  query += ' ORDER BY id DESC';

  const result = await pool.query(query, values);
  res.json(result.rows);
});

/**
 * POST /todos
 * Required: title
 * Optional: due_date, priority
 */
app.post('/todos', async (req, res) => {
  const { title, due_date, priority } = req.body;

  const result = await pool.query(
    `INSERT INTO todos (title, due_date, priority) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [title, due_date || null, priority || 'Low']
  );

  res.json(result.rows[0]);
});

/**
 * PUT /todos/:id
 * Toggle "completed" status
 */
app.put('/todos/:id/toggle', async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `UPDATE todos 
     SET completed = NOT completed 
     WHERE id = $1 
     RETURNING *`,
    [id]
  );

  res.json(result.rows[0]);
});

/**
 * PUT /todos/:id
 * Update title, due_date, priority
 */
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { title, due_date, priority } = req.body;

  const result = await pool.query(
    `UPDATE todos 
     SET title = $1, due_date = $2, priority = $3 
     WHERE id = $4 
     RETURNING *`,
    [title, due_date, priority, id]
  );

  res.json(result.rows[0]);
});

/**
 * DELETE /todos/:id
 */
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM todos WHERE id = $1', [id]);
  res.json({ message: 'Todo deleted' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
