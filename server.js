require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1); // Exit if DB connection fails
  } else {
    console.log('Connected to MySQL');
    createTable();
  }
});

// Function to create the table if it doesn't exist
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
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Table ready');
    }
  });
}

// Middleware
app.use(morgan('dev')); // Logs requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML Form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

// Insert Data
app.post('/insert', (req, res) => {
  const { name, address, phone } = req.body;
  if (!name || !address || !phone) {
    return res.status(400).send('All fields are required');
  }

  const sql = 'INSERT INTO students (name, address, phone) VALUES (?, ?, ?)';
  db.execute(sql, [name, address, phone], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      console.log('Data inserted:', result.insertId);
      res.send('Data inserted successfully');
    }
  });
});

// Delete Data
app.post('/delete', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send('Name is required');
  }

  const sql = 'DELETE FROM students WHERE name = ?';
  db.execute(sql, [name], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data');
    } else if (result.affectedRows === 0) {
      res.status(404).send('No record found to delete');
    } else {
      console.log(`Deleted record with name: ${name}`);
      res.send('Data deleted successfully');
    }
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
