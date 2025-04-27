import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Setup multer for file uploads
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    // Save file as resume.pdf (overwrite existing)
    cb(null, 'resume.pdf');
  },
});
const upload = multer({ storage });

const dataFilePath = path.join(__dirname, 'data', 'dynamicData.json');
const usersFilePath = null; // users.json removed, users stored in dynamicData.json

// Serve static files from uploads folder
app.use('/uploads', express.static(uploadFolder));

// GET endpoint to read JSON data (excluding users)
app.get('/data', (req, res) => {
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data file:', err);
      return res.status(500).json({ error: 'Failed to read data file' });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error('Error parsing JSON data:', parseErr);
      res.status(500).json({ error: 'Failed to parse JSON data' });
    }
  });
});

app.get('/users', (req, res) => {
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data file:', err);
      return res.status(500).json({ error: 'Failed to read data file' });
    }
    try {
      const jsonData = JSON.parse(data);
      const users = jsonData.users || [];
      res.json(users);
    } catch (parseErr) {
      console.error('Error parsing JSON data:', parseErr);
      res.status(500).json({ error: 'Failed to parse JSON data' });
    }
  });
});

app.get('/', (req, res) => {
  res.send('Backend server is running. Use /data endpoint to access data.');
});

// POST endpoint to update JSON data (excluding users)
app.post('/data', (req, res) => {
  const newData = req.body;
  fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing data file:', err);
      return res.status(500).json({ error: 'Failed to write data file' });
    }
    res.json({ message: 'Data updated successfully' });
  });
});

// POST endpoint to update users data
app.post('/users', (req, res) => {
  const newUsers = req.body;
  fs.writeFile(usersFilePath, JSON.stringify(newUsers, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing users file:', err);
      return res.status(500).json({ error: 'Failed to write users file' });
    }
    res.json({ message: 'Users updated successfully' });
  });
});

// POST endpoint for resume PDF upload
app.post('/upload-resume', upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the URL to access the uploaded resume PDF
  const resumeUrl = `/uploads/${req.file.filename}`;
  res.json({ url: resumeUrl });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data file:', err);
      return res.status(500).json({ error: 'Failed to read data file' });
    }
    try {
      const jsonData = JSON.parse(data);
      const users = jsonData.users || [];
      const normalizedUsername = username.trim().toLowerCase();
      const normalizedPassword = password.trim();
      const user = users.find(
        (u) => u.username.trim().toLowerCase() === normalizedUsername && u.password.trim() === normalizedPassword
      );
      if (user) {
        res.json({ message: 'Login successful', user: { username: user.username } });
      } else {
        res.status(401).json({ error: 'Invalid username or password' });
      }
    } catch (parseErr) {
      console.error('Error parsing JSON data:', parseErr);
      res.status(500).json({ error: 'Failed to parse JSON data' });
    }
  });
});

app.post('/update-credentials', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    let jsonData = {};
    if (err) {
      console.error('Error reading data file:', err);
      return res.status(500).json({ error: 'Failed to read data file' });
    } else {
      try {
        jsonData = JSON.parse(data);
      } catch (parseErr) {
        console.error('Error parsing JSON data:', parseErr);
        return res.status(500).json({ error: 'Failed to parse JSON data' });
      }
    }
    const users = jsonData.users || [];
    const normalizedUsername = username.trim().toLowerCase();
    const userIndex = users.findIndex(u => u.username.trim().toLowerCase() === normalizedUsername);
    if (userIndex !== -1) {
      // Replace the entire user object to avoid partial updates
      users[userIndex] = { username: normalizedUsername, password };
    } else {
      users.push({ username: normalizedUsername, password });
    }
    jsonData.users = users;
    fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing data file:', writeErr);
        return res.status(500).json({ error: 'Failed to write data file' });
      }
      res.json({ message: 'Credentials updated successfully' });
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
