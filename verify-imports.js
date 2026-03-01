/**
 * ===========================================
 * SERVER ROUTES VERIFICATION
 * ===========================================
 * Verify that all routes are properly loaded
 */

require('dotenv').config();
const express = require('express');

// Test if models can be imported
console.log('📦 Testing model imports...');
try {
  const { Laboratory, Report, User } = require('./models');
  console.log('✅ Models imported successfully');
  console.log('   - Laboratory:', typeof Laboratory);
  console.log('   - Report:', typeof Report);
  console.log('   - User:', typeof User);
} catch (error) {
  console.error('❌ Model import error:', error.message);
}

// Test if middleware can be imported
console.log('\n🔒 Testing middleware imports...');
try {
  const { authMiddleware, requireRole } = require('./middleware');
  console.log('✅ Middleware imported successfully');
  console.log('   - authMiddleware:', typeof authMiddleware);
  console.log('   - requireRole:', typeof requireRole);
} catch (error) {
  console.error('❌ Middleware import error:', error.message);
}

// Test if controller can be imported
console.log('\n🎮 Testing controller imports...');
try {
  const {
    createLab,
    getLabs,
    getLabById,
    updateLab,
    deleteLab,
    reactivateLab,
    getLabStats
  } = require('./controllers/laboratoryController');
  
  console.log('✅ Laboratory controller imported successfully');
  console.log('   - createLab:', typeof createLab);
  console.log('   - getLabs:', typeof getLabs);
  console.log('   - getLabById:', typeof getLabById);
  console.log('   - updateLab:', typeof updateLab);
  console.log('   - deleteLab:', typeof deleteLab);
  console.log('   - reactivateLab:', typeof reactivateLab);
  console.log('   - getLabStats:', typeof getLabStats);
} catch (error) {
  console.error('❌ Controller import error:', error.message);
  console.error('Stack:', error.stack);
}

// Test if routes can be imported
console.log('\n🛣️  Testing route imports...');
try {
  const laboratoryRoutes = require('./routes/laboratoryRoutes');
  console.log('✅ Laboratory routes imported successfully');
  console.log('   - Routes type:', typeof laboratoryRoutes);
} catch (error) {
  console.error('❌ Routes import error:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n🏁 Import tests completed!');
console.log('\n💡 If all imports succeed but routes still fail:');
console.log('   1. Check server startup logs');
console.log('   2. Verify the server is running on the correct port');
console.log('   3. Check for any middleware errors');
console.log('   4. Test with the debug script: node debug-lab-routes.js');
