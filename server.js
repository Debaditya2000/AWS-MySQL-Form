const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Your MySQL RDS database configuration
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
    createTable(); // Call the function to create the table
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

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Table created or already exists');
    }
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

  db.query(sql, [name, address, phone], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      console.log('Data inserted successfully');
      res.send('Data inserted successfully');
    }
  });
});

// Delete data
app.post('/delete', (req, res) => {
  const { name } = req.body;
  const sql = 'DELETE FROM students WHERE name = ?';

  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data');
    } else {
      console.log('Data deleted successfully');
      res.send('Data deleted successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
