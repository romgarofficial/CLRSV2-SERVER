/**
 * Test Script for Activation Confirmation Email
 * This script tests the activation confirmation email functionality
 */

require('dotenv').config();
const activationConfirmationTemplate = require('./templates/emails/activationConfirmation');
const { sendEmail } = require('./utils/emailService');

async function testActivationEmail() {
  try {
    console.log('🧪 Testing Activation Confirmation Email...\n');
    
    // Test data
    const testData = {
      firstName: 'John',
      fullName: 'John Doe',
      email: 'test@example.com', // Replace with your email for testing
      role: 'student'
    };
    
    // Generate email content
    console.log('📧 Generating email content...');
    const emailContent = activationConfirmationTemplate(
      testData.firstName,
      testData.fullName,
      testData.email,
      testData.role
    );
    
    console.log(`✅ Subject: ${emailContent.subject}`);
    console.log(`✅ Text content: ${emailContent.text.substring(0, 100)}...`);
    console.log(`✅ HTML content length: ${emailContent.html.length} characters`);
    
    // Send email
    console.log('\n📧 Sending activation confirmation email...');
    const result = await sendEmail(
      testData.email,
      emailContent.subject,
      emailContent.text,
      emailContent.html
    );
    
    console.log('✅ Email test completed successfully!');
    console.log('📧 Result:', result);
    
  } catch (error) {
    console.error('❌ Error testing activation email:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testActivationEmail();
