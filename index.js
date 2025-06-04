// index.js

const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });
const winston = require('winston');
const express = require('express');
const http = require('http');
const config = require('config');

const app = express();

// Apply critical initial configurations and middleware
require('./startup/logging')();
require('./startup/config')();
require('./startup/cors')(app);
require('./startup/db')();

// Load validation and routes
require('./startup/validation')();
require('./startup/routes')(app);

// Initialize WebSocket server
const server = http.createServer(app);

// Add error handling for WebSocket or HTTP errors
server.on('error', (err) => {
  winston.error(`Server error: ${err.message}`);
});

// Start the server
const port = process.env.PORT || config.get('port');
server.listen(port, () => winston.info(`Listening on port ${port}...`));


module.exports = server;
