const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const cors= require("cors");
app.use(cors());

// Endpoint to log messages
app.post('/log', (req, res) => {
  const { message } = req.body;
  const logPath = path.join(__dirname, 'logs.txt');
  
  fs.appendFile(logPath, message, (err) => {
    if (err) {
      console.error('Failed to write to log:', err);
      res.status(500).send('Error logging message');
    } else {
      res.status(200).send('Logged successfully');
    }
  });
});

// Endpoint to read log file
app.get('/logs', (req, res) => {
  const logPath = path.join(__dirname, 'logs.txt');

  fs.readFile(logPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading log file:', err);
      return res.status(500).send('Error retrieving logs');
    }
    res.send(data);
  });
});

// Other route definitions...

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});