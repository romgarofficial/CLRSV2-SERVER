/**
 * Welcome Email with OTP Template
 * Used during user registration
 */

const welcomeOTPTemplate = (firstName, otp) => {
  const subject = 'Email Verification - Computer Lab Reporting System';

  const text = `Hello ${firstName}!\n\nWelcome to the Computer Lab Reporting System!\n\nYour verification code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you didn't create this account, please ignore this email.\n\nThank you,\nCLRS Backend System`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to CIT CLRS</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      
      <!-- Email Container -->
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Professional Header -->
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px 20px; text-align: center; border-radius: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="text-align: center;">
                <img src="cid:citclslogo" alt="CIT CLRS Logo" style="max-width: 80px; height: auto; margin-bottom: 15px; border-radius: 8px;" />
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  CIT CLRS
                </h1>
                <p style="color: #e3f2fd; margin: 5px 0 0 0; font-size: 16px; font-weight: 300; letter-spacing: 1px;">
                  Computer Laboratory Reporting System
                </p>
                <div style="width: 120px; height: 3px; background-color: #64b5f6; margin: 15px auto 0 auto; border-radius: 2px;"></div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Main Content Area -->
        <div style="padding: 40px 30px; background-color: white;">
          
          <!-- Welcome Message -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e3c72; margin-bottom: 10px; font-size: 24px; font-weight: 600;">Welcome to CIT CLRS!</h2>
            <div style="width: 120px; height: 2px; background-color: #2196F3; margin: 0 auto;"></div>
          </div>
          
          <p style="color: #555; line-height: 1.8; margin-bottom: 20px; font-size: 16px;">
            Hello <strong style="color: #1e3c72;">${firstName}</strong>,
          </p>
          <p style="color: #555; line-height: 1.8; margin-bottom: 30px; font-size: 16px;">
            Thank you for registering with our Computer Laboratory Reporting System. 
            To complete your registration and secure your account, please verify your email address using the verification code below:
          </p>

          <!-- Enhanced OTP Box -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; margin: 30px 0; border-radius: 15px; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3); border: 1px solid rgba(255,255,255,0.1);">
            <div style="background-color: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <p style="color: white; margin: 0 0 10px 0; font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                Your Verification Code
              </p>
            </div>
            <h1 style="color: white; font-size: 42px; margin: 0; letter-spacing: 12px; font-weight: bold; text-shadow: 0 4px 8px rgba(0,0,0,0.3); font-family: 'Courier New', monospace;">
              ${otp}
            </h1>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">
                Enter this code to verify your account
              </p>
            </div>
          </div>

          <!-- Enhanced Instructions -->
          <div style="background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%); border-left: 5px solid #ffa726; padding: 20px; margin: 25px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(255, 167, 38, 0.1);">
            <div style="display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 10px;">⏰</span>
              <p style="margin: 0; color: #ef6c00; font-weight: 600; font-size: 16px;">
                This verification code expires in <strong>15 minutes</strong>
              </p>
            </div>
          </div>

          <!-- Enhanced Security Notice -->
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%); border-left: 5px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(76, 175, 80, 0.1);">
            <div style="display: flex; align-items: flex-start;">
              <span style="font-size: 20px; margin-right: 10px; margin-top: 2px;">🔒</span>
              <div>
                <p style="margin: 0 0 8px 0; color: #2e7d32; font-weight: 600; font-size: 16px;">Security Notice</p>
                <p style="margin: 0; color: #388e3c; font-size: 14px; line-height: 1.6;">
                  If you didn't create this account, please ignore this email. Your email address will not be used without verification. For security questions, contact our support team.
                </p>
              </div>
            </div>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 35px 0;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Having trouble? Contact our support team at 
              <a href="mailto:support@citclrs.edu" style="color: #2196F3; text-decoration: none; font-weight: 600;">support@citclrs.edu</a>
            </p>
          </div>

        </div>

        <!-- Professional Footer -->
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 40px 30px; text-align: center;">
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
                  Streamlining laboratory operations and enhancing educational excellence
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

module.exports = welcomeOTPTemplate;
