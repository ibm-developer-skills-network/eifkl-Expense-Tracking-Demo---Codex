import express from 'express';
import initSqlJs from 'sql.js';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const require = createRequire(import.meta.url);
const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');

const SQL = await initSqlJs({
  // In Node, return a real filesystem path to the wasm file:
  locateFile: () => wasmPath,
});

const db = new SQL.Database();

db.run(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL
  )
`);

app.use(express.json());

app.get('/', (req, res) => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
  res.sendFile(path.join(__dirname, 'change-port.html'));
});

app.get('/api/expenses', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM expenses ORDER BY date DESC');
    const rows: any[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', (req, res) => {
  const { description, amount, category, date } = req.body;
  try {
    const stmt = db.prepare(
      'INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)'
    );
    stmt.run([description, amount, category, date]);
    stmt.free();

    // sql.js doesn’t track lastInsertRowid, so you’ll need a workaround
    // easiest: query back the last inserted row
    const rowStmt = db.prepare('SELECT * FROM expenses ORDER BY id DESC LIMIT 1');
    rowStmt.step();
    const newRow = rowStmt.getAsObject();
    rowStmt.free();

    res.json(newRow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to insert expense' });
  }
});

app.delete('/api/expenses/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
    stmt.run([req.params.id]);
    stmt.free();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
