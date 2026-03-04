const app = require('../app');

// Export the Express app directly for Vercel's Node.js serverless runtime
// Vercel will invoke this handler with (req, res)
module.exports = app;
