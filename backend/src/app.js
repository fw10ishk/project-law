const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const lawyerRoutes = require('./routes/lawyerRoutes');
const chatRoutes = require('./routes/chatRoutes');
const courtRoutes = require('./routes/courtRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/lawyer', lawyerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/court', courtRoutes);

app.use(errorMiddleware);

module.exports = app;
