/* ============================================================
   LEGALCONNECT — EXPRESS APPLICATION
   app.js — Middleware chain, static hosting, API mount
   ============================================================ */

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const apiRoutes = require('./routes');
const { notFoundHandler, errorMiddleware } = require('./middlewares/errorMiddleware');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,      // SPA loads Google Fonts/Material Symbols
  crossOriginResourcePolicy: { policy: 'same-site' }
}));
app.use(cors());
app.use(express.json({ limit: '3mb' }));   // room for base64 profile photos
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/* API */
app.use('/api', apiRoutes);

/* Static SPA (lawyer portal + shared design system + admin console) */
const frontendRoot = path.join(__dirname, '..', '..', 'frontend');
app.use('/frontend', express.static(frontendRoot, { maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));

/* Convenience redirects */
app.get('/', (_req, res) => res.redirect('/frontend/lawyer/index.html'));
app.get('/admin', (_req, res) => res.sendFile(path.join(frontendRoot, 'admin', 'index.html')));

app.use(notFoundHandler);
app.use(errorMiddleware);

module.exports = app;
