/**
 * Account Activation Confirmation Email Template
 * Used after successful OTP verification
 */

const activationConfirmationTemplate = (firstName, fullName, email, role) => {
  const subject = 'Account Activated - Welcome to CIT CLRS!';
  
  const text = `Hello ${firstName}!\n\nCongratulations! Your CIT CLRS account has been successfully activated.\n\nAccount Details:\nName: ${fullName}\nEmail: ${email}\nRole: ${role}\n\nYou can now log in and access the Computer Laboratory Reporting System.\n\nWelcome to CIT CLRS!\n\nCIT CLRS Team`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Activated - CIT CLRS</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      
      <!-- Email Container -->
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Professional Header -->
        <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); padding: 30px 20px; text-align: center; border-radius: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="text-align: center;">
                <img src="cid:citclslogo" alt="CIT CLRS Logo" style="max-width: 80px; height: auto; margin-bottom: 15px; border-radius: 8px;" />
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  CIT CLRS
                </h1>
                <p style="color: #c8e6c9; margin: 5px 0 0 0; font-size: 16px; font-weight: 300; letter-spacing: 1px;">
                  Computer Laboratory Reporting System
                </p>
                <div style="width: 120px; height: 3px; background-color: #ffffff; margin: 15px auto 0 auto; border-radius: 2px;"></div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Main Content Area -->
        <div style="padding: 40px 30px; background-color: white;">
          
          <!-- Success Message -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #2e7d32; margin-bottom: 10px; font-size: 26px; font-weight: 700;">Account Activated!</h2>
            <div style="width: 120px; height: 2px; background-color: #4caf50; margin: 0 auto;"></div>
          </div>
          
          <p style="color: #555; line-height: 1.8; margin-bottom: 20px; font-size: 18px; text-align: center;">
            🎉 <strong>Congratulations, ${firstName}!</strong>
          </p>
          <p style="color: #555; line-height: 1.8; margin-bottom: 30px; font-size: 16px; text-align: center;">
            Your CIT CLRS account has been successfully activated. You can now access all features of our Computer Laboratory Reporting System.
          </p>

          <!-- Account Details Box -->
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%); padding: 25px; margin: 30px 0; border-radius: 12px; border-left: 5px solid #4caf50; box-shadow: 0 3px 15px rgba(76, 175, 80, 0.1);">
            <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              👤 Account Information
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #388e3c; font-weight: 600; width: 30%;">Full Name:</td>
                <td style="padding: 8px 0; color: #2e7d32; font-weight: 500;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #388e3c; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #2e7d32; font-weight: 500;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #388e3c; font-weight: 600;">Role:</td>
                <td style="padding: 8px 0; color: #2e7d32; font-weight: 500; text-transform: capitalize;">${role}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #388e3c; font-weight: 600;">Status:</td>
                <td style="padding: 8px 0;">
                  <span style="background-color: #4caf50; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                    ✓ ACTIVE
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Next Steps -->
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-left: 5px solid #2196f3; padding: 25px; margin: 25px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(33, 150, 243, 0.1);">
            <h3 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              🚀 What's Next?
            </h3>
            <ul style="color: #1976d2; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>Login to your account</strong> using your email and password</li>
              <li><strong>Complete your profile</strong> if additional information is required</li>
              <li><strong>Explore the system</strong> and familiarize yourself with available features</li>
              <li><strong>Contact support</strong> if you need any assistance getting started</li>
            </ul>
          </div>

          <!-- Security Notice -->
          <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffcc02 20%, #fff3e0 100%); border-left: 5px solid #ff9800; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(255, 152, 0, 0.1);">
            <div style="display: flex; align-items: flex-start;">
              <span style="font-size: 20px; margin-right: 10px; margin-top: 2px;">🔐</span>
              <div>
                <p style="margin: 0 0 8px 0; color: #e65100; font-weight: 600; font-size: 16px;">Security Reminder</p>
                <p style="margin: 0; color: #ef6c00; font-size: 14px; line-height: 1.6;">
                  Keep your login credentials secure and never share them with others. If you notice any suspicious activity on your account, contact our support team immediately.
                </p>
              </div>
            </div>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 40px 0;">
            <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); display: inline-block; padding: 15px 40px; border-radius: 50px; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3); margin-bottom: 20px;">
              <p style="color: white; margin: 0; font-size: 16px; font-weight: 600; text-decoration: none;">
                🚀 Ready to Get Started!
              </p>
            </div>
            <p style="color: #666; font-size: 14px; margin: 0;">
              Need help? Contact our support team at 
              <a href="mailto:support@citclrs.edu" style="color: #4caf50; text-decoration: none; font-weight: 600;">support@citclrs.edu</a>
            </p>
          </div>

        </div>

        <!-- Professional Footer -->
        <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); padding: 40px 30px; text-align: center;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="text-align: center; padding-bottom: 20px;">
                <img src="cid:citclslogo" alt="CIT CLRS Logo" style="max-width: 60px; height: auto; opacity: 0.8; border-radius: 6px;" />
              </td>
            </tr>
            <tr>
              <td style="text-align: center;">
                <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">
                  Computer Laboratory Reporting System
                </h3>
                <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
                  Empowering education through efficient laboratory management
                </p>
                <div style="border-top: 1px solid #455a64; margin: 20px auto; width: 60%;"></div>
                <p style="color: #ffffff; font-size: 12px; margin: 0 0 10px 0;">
                  This is an automated message from CIT CLRS Backend System.<br>
                  Please do not reply to this email.
                </p>
                <p style="color: #ffffff; font-size: 11px; margin: 0; font-weight: 500;">
                  © ${new Date().getFullYear()} Computer Institute of Technology - CLRS. All rights reserved.
                </p>
                <div style="margin-top: 15px;">
                  <p style="color: #ffffff; font-size: 10px; margin: 0;">
                    📧 support@citclrs.edu | 🌐 www.citclrs.edu | 📱 +1 (555) 123-4567
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </div>

      </div>
    </body>
    </html>
  `;
  
  return { subject, text, html };
};

module.exports = activationConfirmationTemplate;
