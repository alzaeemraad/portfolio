import express from 'express';

import 'dotenv/config';
import cors from 'cors';
import multer from 'multer';
import mongoose from 'mongoose';
import path from 'path';
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
console.log('Registering /projects router');


// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI environment variable not set');
  process.exit(1);
}
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Define Setting schema and model
const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed }
});
const Setting = mongoose.model('Setting', settingSchema);

// Ensure uploads folder exists and serve it
const uploadFolder = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadFolder));

// Multer storage setups
const resumeStorage = multer.diskStorage({
  destination: uploadFolder,
  filename: (_req, file, cb) => {
    const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `resume-${suffix}${path.extname(file.originalname)}`);
  },
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
app.get('/data', async (_req, res) => {
  try {
    const settings = await Setting.find({});
    const result = {};
    settings.forEach(s => {
      result[s.key] = s.value;
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/data', async (req, res) => {
  try {
    const updates = req.body;
    const keys = Object.keys(updates);
    const updatePromises = keys.map(key =>
      Setting.findOneAndUpdate(
        { key },
        { value: updates[key] },
        { upsert: true, new: true }
      )
    );
    await Promise.all(updatePromises);
    res.json({ message: 'Data updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// Users endpoints (unchanged)
app.get('/users', (_req, res) => {
  res.status(501).json({ error: 'Users endpoint not implemented in this version' });
});
app.post('/users', (_req, res) => {
  res.status(501).json({ error: 'Users endpoint not implemented in this version' });
});

// Load users data
import fs from 'fs';
const usersDataPath = path.join(__dirname, '../backend/data/users.json');
let users = [];
try {
  const usersRaw = fs.readFileSync(usersDataPath, 'utf-8');
  users = JSON.parse(usersRaw);
} catch (err) {
  console.error('Failed to load users data:', err);
}

// Auth endpoints
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  // For simplicity, return success with user object
  res.json({ message: 'Login successful', user: { username: user.username } });
});

app.post('/update-credentials', (req, res) => {
  // Not implemented yet
  res.status(501).json({ error: 'Auth endpoint not implemented in this version' });
});

// File‐upload endpoints (unchanged)
app.post('/upload-resume', uploadResume.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  try {
    const profileSetting = await Setting.findOne({ key: 'profile' });
    let profileData = profileSetting ? profileSetting.value : {};
    profileData.resumePdf = fileUrl;
    await Setting.findOneAndUpdate(
      { key: 'profile' },
      { value: profileData },
      { upsert: true, new: true }
    );
    res.json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resume URL in database' });
  }
});
app.post('/upload-profile-image', uploadProfileImage.single('profileImage'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  try {
    const profileSetting = await Setting.findOne({ key: 'profile' });
    let profileData = profileSetting ? profileSetting.value : {};
    profileData.profileimage = fileUrl;
    await Setting.findOneAndUpdate(
      { key: 'profile' },
      { value: profileData },
      { upsert: true, new: true }
    );
    res.json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile image URL in database' });
  }
});
app.post('/upload-project-image', uploadProjectImage.single('projectImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Launch!
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
