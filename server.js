const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// MySQL RDS Database Configuration
const db = mysql.createConnection({
  host: 'database-1.cx2kqweacunr.ap-south-1.rds.amazonaws.com',
  user: 'admin',
  password: 'vinsys123',
  database: 'INDEL60',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
    createTable();
  }
});

// Create table if not exists
function createTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL
    )
  `;
  db.query(sql, (err) => {
    if (err) console.error('Error creating table:', err);
    else console.log('Table created or already exists');
  });
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

// Insert data
app.post('/insert', (req, res) => {
  const { name, address, phone } = req.body;
  const sql = 'INSERT INTO students (name, address, phone) VALUES (?, ?, ?)';
  db.query(sql, [name, address, phone], (err) => {
    if (err) res.status(500).send('Error inserting data');
    else res.send('Data inserted successfully');
  });
});

// Fetch all data
app.get('/list', (req, res) => {
  const sql = 'SELECT * FROM students';
  db.query(sql, (err, results) => {
    if (err) res.status(500).json({ error: 'Error fetching data' });
    else res.json(results);
  });
});

// Update data
app.post('/update', (req, res) => {
  const { id, name, address, phone } = req.body;
  if (!id || !name || !address || !phone) return res.status(400).send('All fields required');
  const sql = 'UPDATE students SET name = ?, address = ?, phone = ? WHERE id = ?';
  db.query(sql, [name, address, phone, id], (err, result) => {
    if (err) res.status(500).send('Error updating data');
    else if (result.affectedRows === 0) res.status(404).send('No record found');
    else res.send('Data updated successfully');
  });
});

// Delete data
app.post('/delete', (req, res) => {
  const { id } = req.body;
  const sql = 'DELETE FROM students WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) res.status(500).send('Error deleting data');
    else if (result.affectedRows === 0) res.status(404).send('No record found');
    else res.send('Data deleted successfully');
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
