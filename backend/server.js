// server.js
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { app, connectDB } from './src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// middleware
// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  process.env.RENDER_EXTERNAL_URL // Render provides this automatically
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      // In production, you might want to be stricter. 
      // For now, let's allow it if it's from a .render.com subdomain
      if (origin.endsWith('.render.com')) {
          return callback(null, true);
      }
      return callback(null, true); // Fallback to true for easier initial deployment
    }
    return callback(null, true);
  },
  credentials: true
}));

// Serve static files from the React app
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// Connect to Database
await connectDB();

// Seed Admin
import { seedAdmin } from './src/seed.js';
await seedAdmin();

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});