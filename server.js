require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { AssemblyAI } = require('assemblyai');
const multer = require('multer');
const path = require('path');

// Initialize Firebase Admin
console.log("Checking FIREBASE_SERVICE_ACCOUNT...");
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.log("FIREBASE_SERVICE_ACCOUNT env var found.");
  try {
    // Handle potential double quotes if the user pasted it with quotes in Vercel UI
    let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    if (rawJson.startsWith('"') && rawJson.endsWith('"')) {
        rawJson = rawJson.substring(1, rawJson.length - 1);
    }
    serviceAccount = JSON.parse(rawJson);
    console.log("Successfully parsed FIREBASE_SERVICE_ACCOUNT JSON");
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", e.message);
  }
}

if (!serviceAccount) {
  console.log("Attempting to load serviceAccountKey.json...");
  try {
    serviceAccount = require('./serviceAccountKey.json');
    console.log("Loaded serviceAccountKey.json successfully");
  } catch (e) {
    console.warn("serviceAccountKey.json not found.");
  }
}

if (serviceAccount) {
  // Fix for private key newlines in environment variables
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'seeman-38eca.firebasestorage.app'
    });
    console.log("Firebase Admin initialized successfully");
  } catch (e) {
    console.error("Firebase Admin initialization failed:", e.message);
  }
}

// Lazy bucket getter to avoid crashing if Firebase isn't ready
const getBucket = () => {
    try {
        return admin.storage().bucket();
    } catch (e) {
        console.error("Bucket access failed - Firebase might not be initialized:", e.message);
        return null;
    }
};

// Initialize AssemblyAI
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname)));

// Multer for file uploads (in memory)
const upload = multer({ storage: multer.memoryStorage() });

// Image upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const bucket = getBucket();
    if (!bucket) {
      return res.status(500).json({ error: 'Storage service unavailable' });
    }

    const fileName = `images/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });

    // Make file publicly readable
    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log('Uploaded image URL:', publicUrl);
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Audio upload endpoint
app.post('/api/upload-audio', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const bucket = getBucket();
    if (!bucket) {
      return res.status(500).json({ error: 'Storage service unavailable' });
    }

    const fileName = `voice_recordings/recording_${Date.now()}.wav`;
    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });

    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log('Uploaded audio URL:', publicUrl);
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Audio Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

// AssemblyAI endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioUrl } = req.body;
    
    const params = {
      audio: audioUrl,
      language_code: "en",
      speech_models: ["universal-2"]
    };

    const transcript = await client.transcripts.transcribe(params);
    res.json({ text: transcript.text });
  } catch (error) {
    require('fs').writeFileSync('server_err.log', error.stack || error.message || String(error));
    console.error('AssemblyAI Error:', error.message);
    res.status(500).json({ error: 'Failed to transcribe audio', details: error.message });
  }
});

// Roboflow endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    const response = await fetch('https://serverless.roboflow.com/civic-issue/workflows/custom-workflow', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          api_key: process.env.ROBOFLOW_API_KEY,
          inputs: {
              "image": {"type": "url", "value": imageUrl}
          }
      })
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Roboflow Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
