const serverless = require('serverless-http');
const app = require('../app');

// Wrap the Express app with serverless-http for Vercel's serverless runtime
module.exports = serverless(app);
