const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3000;

// Set up body parser
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database(':memory:');

// Create a table for questions
db.serialize(() => {
  db.run("CREATE TABLE questions (id INTEGER PRIMARY KEY, question TEXT, option1 TEXT, option2 TEXT, option3 TEXT, option4 TEXT, answer TEXT)");

  // Insert default questions
  const questions = [
    {
      question: "What is the capital of France?",
      option1: "Berlin",
      option2: "Madrid",
      option3: "Paris",
      option4: "Lisbon",
      answer: "Paris"
    },
    {
      question: "What is 2 + 2?",
      option1: "3",
      option2: "4",
      option3: "5",
      option4: "6",
      answer: "4"
    },
    {
      question: "Who wrote 'Romeo and Juliet'?",
      option1: "Charles Dickens",
      option2: "Mark Twain",
      option3: "William Shakespeare",
      option4: "J.K. Rowling",
      answer: "William Shakespeare"
    },
    {
      question: "What is the largest planet in our solar system?",
      option1: "Earth",
      option2: "Mars",
      option3: "Jupiter",
      option4: "Saturn",
      answer: "Jupiter"
    },
    {
      question: "What is the chemical symbol for water?",
      option1: "H2O",
      option2: "CO2",
      option3: "O2",
      option4: "NaCl",
      answer: "H2O"
    }
  ];

  const stmt = db.prepare("INSERT INTO questions (question, option1, option2, option3, option4, answer) VALUES (?, ?, ?, ?, ?, ?)");
  questions.forEach(q => {
    stmt.run(q.question, q.option1, q.option2, q.option3, q.option4, q.answer);
  });
  stmt.finalize();
});

// Socket connection
io.on('connection', (socket) => {
  console.log('New client connected');

  // Send questions to client
  db.all("SELECT * FROM questions", [], (err, rows) => {
    if (err) {
      throw err;
    }
    socket.emit('loadQuestions', rows);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
