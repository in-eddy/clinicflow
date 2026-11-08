const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/patients', require('./routes/patients.routes'));
app.use('/api/appointments', require('./routes/appointments.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

module.exports = app;