const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// RDS Database connection
const db = mysql.createConnection({
  host: 'mydbinstance.abc123xyz.us-east-1.rds.amazonaws.com', // replace with your RDS endpoint
  user: 'admin', // RDS username
  password: 'MyStrongPassword123', // RDS password
  database: 'myappdb' // replace with your DB name
});

// Connect to RDS
db.connect(err => {
  if (err) {
    console.error('❌ DB connection failed:', err.stack);
    process.exit(1);
  }
  console.log('✅ Connected to RDS as id ' + db.threadId);
});

// Routes

// Default route
app.get('/', (req, res) => {
  res.send('Hello from Node.js backend connected to RDS!');
});

// GET all users
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ users: results });
  });
});

// GET a single user by id
app.get('/api/users/:id', (req, res) => {
  db.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (!results.length) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
});

// POST a new user
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

  db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ id: result.insertId, name, email });
  });
});

// PUT update a user
app.put('/api/users/:id', (req, res) => {
  const { name, email } = req.body;

  db.query(
    'UPDATE users SET name = ?, email = ? WHERE id = ?',
    [name, email, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
      res.json({ id: parseInt(req.params.id), name, email });
    }
  );
});

// DELETE a user
app.delete('/api/users/:id', (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
