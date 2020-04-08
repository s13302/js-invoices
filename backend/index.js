const express = require('express');
require('dotenv').config();

const apiRoute = require('./route/Route');

const PORT = process.env.PORT || 3001;

const app = express();

app.use('/api', apiRoute);

app.listen(PORT, () => {
  console.log(`🧾 Server is listening on http://localhost:${PORT}/`);
});
