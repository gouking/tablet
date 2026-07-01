require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const tabletRoutes = require('./routes/tablets');
const printRoutes = require('./routes/print');
const statsRoutes = require('./routes/stats');
const templeRoutes = require('./routes/temples');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: (origin, cb) => { if (!origin || origin.endsWith('.railway.app') || origin === 'http://localhost:5173') cb(null,true); else cb(new Error('CORS')); },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tablets', tabletRoutes);
app.use('/api/print', printRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/temples', templeRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`伺服器啟動於 port ${PORT}`);
});
