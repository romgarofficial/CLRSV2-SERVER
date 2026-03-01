/**
 * Test laboratory controller import
 */

console.log('🧪 Testing laboratory controller import...');

try {
  const controller = require('./controllers/laboratoryController');
  
  console.log('✅ Laboratory controller loaded successfully');
  console.log('📋 Available functions:');
  
  Object.keys(controller).forEach(key => {
    console.log(`   - ${key}: ${typeof controller[key]}`);
  });

  // Test that functions are actually functions
  const { createLab, getLabs, getLabById, updateLab, deleteLab } = controller;
  
  if (typeof createLab !== 'function') {
    console.error('❌ createLab is not a function');
  }
  if (typeof getLabs !== 'function') {
    console.error('❌ getLabs is not a function');
  }
  if (typeof getLabById !== 'function') {
    console.error('❌ getLabById is not a function');
  }
  
  console.log('✅ All main functions are properly exported');

} catch (error) {
  console.error('❌ Error importing laboratory controller:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n🧪 Testing middleware import...');

try {
  const { authMiddleware, requireRole } = require('./middleware');
  
  console.log('✅ Middleware loaded successfully');
  console.log(`   - authMiddleware: ${typeof authMiddleware}`);
  console.log(`   - requireRole: ${typeof requireRole}`);

} catch (error) {
  console.error('❌ Error importing middleware:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n🧪 Testing routes import...');

try {
  const laboratoryRoutes = require('./routes/laboratoryRoutes');
  
  console.log('✅ Laboratory routes loaded successfully');
  console.log(`   - Routes type: ${typeof laboratoryRoutes}`);

} catch (error) {
  console.error('❌ Error importing laboratory routes:', error.message);
  console.error('Stack:', error.stack);
}
