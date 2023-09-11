const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files built by Parcel
app.use(express.static(path.join(__dirname, 'dist')));

// Serve the index.html file built by Parcel
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'login.html'));
})

app.get('/api/greeting', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
