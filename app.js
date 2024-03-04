const express = require('express');
const { Pool } = require('pg');

const app = express();

app.use(express.json());

// Database connection configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'demo',
    password: 'postgres',
    port: 5432, // Default PostgreSQL port
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database at:', res.rows[0].now);
    }
});

// Get all todos
app.get('/todos', (req, res) => {
    pool.query('SELECT * FROM todos', (err, result) => {
        if (err) {
            console.error('Error fetching todos:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result.rows);
        }
    });
});

// Create a new todo
app.post('/todos', (req, res) => {
    const { task } = req.body;
    if (!task) {
        res.status(400).json({ error: 'Task is required' });
        return;
    }
    pool.query('INSERT INTO todos (task) VALUES ($1) RETURNING *', [task], (err, result) => {
        if (err) {
            console.error('Error creating todo:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(201).json(result.rows[0]);
        }
    });
});

// PUT update todo
app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { task, completed } = req.body;
    try {
      const { rows } = await pool.query('UPDATE todos SET task = $1, completed = $2 WHERE id = $3 RETURNING *', [task, completed, id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error('Error updating todo', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // DELETE todo
  app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const { rows } = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json({ message: 'Todo deleted successfully' });
    } catch (err) {
      console.error('Error deleting todo', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
// Start the server
const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
