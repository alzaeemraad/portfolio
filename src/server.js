import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';

// Resolve __filename & __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS and body-parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure data directory & file exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dataFilePath = path.join(dataDir, 'dynamicData.json');
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify({ users: [], settings: {} }, null, 2));
}
// We’ll store users in the same JSON
const usersFilePath = dataFilePath;

// Ensure uploads folder exists and serve it
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });
app.use('/uploads', express.static(uploadFolder));

// Multer storage setups
const resumeStorage = multer.diskStorage({
  destination: uploadFolder,
  filename: (_req, _file, cb) => cb(null, 'resume.pdf'),
});
const profileImageStorage = multer.diskStorage({
  destination: uploadFolder,
  filename: (_req, file, cb) => {
    const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `profile-image-${suffix}${path.extname(file.originalname)}`);
  },
});
const projectImageStorage = multer.diskStorage({
  destination: uploadFolder,
  filename: (_req, file, cb) => {
    const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `project-image-${suffix}${path.extname(file.originalname)}`);
  },
});
const uploadResume = multer({ storage: resumeStorage });
const uploadProfileImage = multer({ storage: profileImageStorage });
const uploadProjectImage = multer({ storage: projectImageStorage });

// Health-check
app.get('/', (_req, res) => {
  res.send('Backend server is running. Use /data, /users, or upload endpoints.');
});

// Data endpoints
app.get('/data', (_req, res) => {
  fs.readFile(dataFilePath, 'utf8', (e, raw) => {
    if (e) return res.status(500).json({ error: 'Failed to read data file' });
    try { res.json(JSON.parse(raw)); }
    catch { res.status(500).json({ error: 'Malformed JSON' }); }
  });
});
app.post('/data', (req, res) => {
  fs.readFile(dataFilePath, 'utf8', (e, raw) => {
    if (e) return res.status(500).json({ error: 'Read failure' });
    let base = {};
    try { base = JSON.parse(raw); } catch {}
    // Preserve users array from base
    const users = base.users || [];
    // Merge new data, but replace projects array entirely if provided
    const merged = {
      ...base,
      ...req.body,
      users,
      projects: req.body.projects !== undefined ? req.body.projects : base.projects,
    };
    fs.writeFile(dataFilePath, JSON.stringify(merged, null, 2), 'utf8', w => {
      if (w) return res.status(500).json({ error: 'Write failure' });
      res.json({ message: 'Data updated successfully' });
    });
  });
});

// Users endpoints
app.get('/users', (_req, res) => {
  fs.readFile(usersFilePath, 'utf8', (e, raw) => {
    if (e) return res.status(500).json({ error: 'Read users failure' });
    try {
      const all = JSON.parse(raw);
      res.json(all.users || []);
    } catch {
      res.status(500).json({ error: 'Malformed JSON' });
    }
  });
});
app.post('/users', (req, res) => {
  fs.readFile(usersFilePath, 'utf8', (e, raw) => {
    if (e) return res.status(500).json({ error: 'Read users failure' });
    let data = {};
    try { data = JSON.parse(raw); } catch {}
    data.users = req.body;
    fs.writeFile(usersFilePath, JSON.stringify(data, null, 2), 'utf8', w => {
      if (w) return res.status(500).json({ error: 'Write users failure' });
      res.json({ message: 'Users updated successfully' });
    });
  });
});

// Auth
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  fs.readFile(usersFilePath, 'utf8', (e, raw) => {
    if (e) return res.status(500).json({ error: 'Read failure' });
    const { users = [] } = JSON.parse(raw);
    const user = users.find(u =>
      u.username.toLowerCase() === username.trim().toLowerCase() &&
      u.password === password.trim()
    );
    if (user) return res.json({ message: 'Login successful', user: { username: user.username } });
    res.status(401).json({ error: 'Invalid credentials' });
  });
});
app.post('/update-credentials', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });
  fs.readFile(usersFilePath, 'utf8', (e, raw) => {
    let data = {};
    try { data = JSON.parse(raw); } catch {}
    data.users = data.users || [];
    const idx = data.users.findIndex(u => u.username === username.trim());
    if (idx > -1) data.users[idx] = { username: username.trim(), password };
    else data.users.push({ username: username.trim(), password });
    fs.writeFile(usersFilePath, JSON.stringify(data, null, 2), 'utf8', w => {
      if (w) return res.status(500).json({ error: 'Write failure' });
      res.json({ message: 'Credentials updated successfully' });
    });
  });
});

// File‐upload endpoints
app.post('/upload-resume', uploadResume.single('resume'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});
app.post('/upload-profile-image', uploadProfileImage.single('profileImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});
app.post('/upload-project-image', uploadProjectImage.single('projectImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Launch!
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
