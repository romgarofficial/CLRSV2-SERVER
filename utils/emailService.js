/**
 * Email Configuration and Utilities
 * Contains email service configuration and helper functions
 */

const path = require('path');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email Configuration
const emailConfig = {
  // SendGrid configuration (to be implemented)
  sendGrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@citclrs.edu',
    fromName: process.env.FROM_NAME || 'CIT CLRS'
  },
  
  // Logo attachment configuration
  logo: {
    filename: 'citclslogo.png',
    path: path.join(__dirname, '..', 'assets', 'citclslogo.png'), // Adjust path as needed
    cid: 'citclslogo', // Content ID used in email templates
    disposition: 'inline',
    type: 'image/png'
  },

  // Email templates configuration
  templates: {
    welcomeOTP: {
      subject: 'Email Verification - Computer Lab Reporting System',
      priority: 'high'
    },
    resendOTP: {
      subject: 'New Verification Code - CIT CLRS',
      priority: 'high'
    }
  }
};

// Helper function to prepare email with attachments
const prepareEmailWithLogo = (to, subject, text, html) => {
  const emailData = {
    to,
    from: {
      email: emailConfig.sendGrid.fromEmail,
      name: emailConfig.sendGrid.fromName
    },
    subject,
    text,
    html,
    attachments: []
  };

  // Add logo attachment if file exists
  const logoPath = emailConfig.logo.path;
  if (fs.existsSync(logoPath)) {
    const logoContent = fs.readFileSync(logoPath);
    emailData.attachments.push({
      content: logoContent.toString('base64'),
      filename: emailConfig.logo.filename,
      type: emailConfig.logo.type,
      disposition: emailConfig.logo.disposition,
      content_id: emailConfig.logo.cid
    });
  } else {
    console.warn(`⚠️  Logo file not found at: ${logoPath}`);
    console.warn('📧 Email will be sent without logo attachment');
  }

  return emailData;
};

// Enhanced SendGrid email function
const sendEmailWithSendGrid = async (to, subject, text, html) => {
  try {
    const emailData = prepareEmailWithLogo(to, subject, text, html);
    
    // Send email using SendGrid
    console.log('📧 Sending email via SendGrid...');
    const response = await sgMail.send(emailData);
    
    console.log('✅ Email sent successfully via SendGrid');
    console.log('📧 To:', emailData.to);
    console.log('📧 Subject:', emailData.subject);
    console.log('📧 Attachments:', emailData.attachments.length > 0 ? 'Logo attached' : 'No attachments');
    console.log('📧 Message ID:', response[0].headers['x-message-id']);
    
    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      timestamp: new Date().toISOString(),
      provider: 'SendGrid'
    };
    
  } catch (error) {
    console.error('❌ SendGrid email error:', error);
    
    // Log more specific error information
    if (error.response) {
      console.error('📧 SendGrid Error Details:', error.response.body);
    }
    
    throw new Error(`Failed to send email via SendGrid: ${error.message}`);
  }
};

// Fallback email function for development
const sendEmailDevelopment = async (to, subject, text, html) => {
  console.log('\n' + '='.repeat(60));
  console.log('📧 DEVELOPMENT EMAIL SIMULATION');
  console.log('='.repeat(60));
  console.log(`📧 To: ${to}`);
  console.log(`📧 Subject: ${subject}`);
  console.log(`📧 Text Content:`);
  console.log(text);
  console.log(`📧 Logo: ${fs.existsSync(emailConfig.logo.path) ? '✅ Available' : '❌ Missing'}`);
  console.log('='.repeat(60) + '\n');
  
  return {
    success: true,
    messageId: 'dev-message-id',
    timestamp: new Date().toISOString(),
    note: 'Development mode - email not actually sent'
  };
};

// Main email sending function
const sendEmail = async (to, subject, text, html) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasSendGridKey = process.env.SENDGRID_API_KEY;
  
  if (hasSendGridKey) {
    // Use SendGrid if API key is available
    return await sendEmailWithSendGrid(to, subject, text, html);
  } else {
    // Fallback to development mode
    console.log('⚠️  No SendGrid API key found, using development mode');
    return await sendEmailDevelopment(to, subject, text, html);
  }
};

module.exports = {
  emailConfig,
  sendEmail,
  prepareEmailWithLogo,
  sendEmailWithSendGrid,
  sendEmailDevelopment
};
