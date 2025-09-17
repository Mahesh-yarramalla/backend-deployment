const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // <-- Listen on all interfaces

// simple in-memory items
let items = [{ id: 1, text: 'hello world' }];

// root + health
app.get('/', (req, res) => res.send('Hello from Elastic Beanstalk!'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// REST: GET items
app.get('/api/items', (req, res) => res.json(items));

// POST new item
app.post('/api/items', (req, res) => {
  const id = items.length ? items[items.length - 1].id + 1 : 1;
  const item = { id, text: req.body.text || `item-${id}` };
  items.push(item);
  res.status(201).json(item);
});

// Example: connect to PostgreSQL if env vars are present
if (process.env.PGHOST) {
  const { Pool } = require('pg');
  const pool = new Pool(); // uses PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT

  app.get('/db-time', async (req, res) => {
    try {
      const r = await pool.query('SELECT NOW() as now');
      res.json({ now: r.rows[0].now });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// Listen on HOST 0.0.0.0 so EC2 public IP can access
app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
