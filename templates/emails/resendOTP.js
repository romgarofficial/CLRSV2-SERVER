/**
 * Resend OTP Email Template
 * Used when user requests a new OTP
 */

const resendOTPTemplate = (firstName, otp) => {
  const subject = 'New Verification Code - CIT CLRS';
  
  const text = `Hello ${firstName}!\n\nYou requested a new verification code for your CIT CLRS account.\n\nYour new verification code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, please contact our support team.\n\nThank you,\nCIT CLRS Backend System`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Verification Code - CIT CLRS</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      
      <!-- Email Container -->
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Professional Header -->
        <div style="background: linear-gradient(135deg, #b71c1c 0%, #c62828 100%); padding: 30px 20px; text-align: center; border-radius: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="text-align: center;">
                <img src="cid:citclslogo" alt="CIT CLRS Logo" style="max-width: 80px; height: auto; margin-bottom: 15px; border-radius: 8px;" />
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  CIT CLRS
                </h1>
                <p style="color: #ffcdd2; margin: 5px 0 0 0; font-size: 16px; font-weight: 300; letter-spacing: 1px;">
                  Computer Laboratory Reporting System
                </p>
                <div style="width: 120px; height: 3px; background-color: #ffffff; margin: 15px auto 0 auto; border-radius: 2px;"></div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Main Content Area -->
        <div style="padding: 40px 30px; background-color: white;">
          
          <!-- Resend Message -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #b71c1c; margin-bottom: 10px; font-size: 24px; font-weight: 600;">New Verification Code</h2>
            <div style="width: 120px; height: 2px; background-color: #c62828; margin: 0 auto;"></div>
          </div>
          
          <p style="color: #555; line-height: 1.8; margin-bottom: 20px; font-size: 16px;">
            Hello <strong style="color: #b71c1c;">${firstName}</strong>,
          </p>
          <p style="color: #555; line-height: 1.8; margin-bottom: 30px; font-size: 16px;">
            You requested a new verification code for your CIT CLRS account. 
            Please use the new verification code below to complete your email verification:
          </p>

          <!-- Enhanced OTP Box (Red Theme) -->
          <div style="background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%); padding: 40px; text-align: center; margin: 30px 0; border-radius: 15px; box-shadow: 0 8px 25px rgba(183, 28, 28, 0.3); border: 1px solid rgba(255,255,255,0.1);">
            <div style="background-color: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <p style="color: white; margin: 0 0 10px 0; font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                Your New Verification Code
              </p>
            </div>
            <h1 style="color: white; font-size: 42px; margin: 0; letter-spacing: 12px; font-weight: bold; text-shadow: 0 4px 8px rgba(0,0,0,0.3); font-family: 'Courier New', monospace;">
              ${otp}
            </h1>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">
                Enter this new code to verify your account
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

          <!-- Previous Code Notice -->
          <div style="background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%); border-left: 5px solid #29b6f6; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(41, 182, 246, 0.1);">
            <div style="display: flex; align-items: flex-start;">
              <span style="font-size: 20px; margin-right: 10px; margin-top: 2px;">ℹ️</span>
              <div>
                <p style="margin: 0 0 8px 0; color: #0277bd; font-weight: 600; font-size: 16px;">Important Notice</p>
                <p style="margin: 0; color: #0288d1; font-size: 14px; line-height: 1.6;">
                  Any previous verification codes have been invalidated. Please use only this new code to complete your verification.
                </p>
              </div>
            </div>
          </div>

          <!-- Security Alert -->
          <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border-left: 5px solid #c62828; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(198, 40, 40, 0.1);">
            <div style="display: flex; align-items: flex-start;">
              <span style="font-size: 20px; margin-right: 10px; margin-top: 2px;">🚨</span>
              <div>
                <p style="margin: 0 0 8px 0; color: #b71c1c; font-weight: 600; font-size: 16px;">Security Alert</p>
                <p style="margin: 0; color: #c62828; font-size: 14px; line-height: 1.6;">
                  If you didn't request this new verification code, please contact our support team immediately at 
                  <a href="mailto:support@citclrs.edu" style="color: #b71c1c; text-decoration: underline; font-weight: 600;">support@citclrs.edu</a>
                </p>
              </div>
            </div>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 35px 0;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Need help? Contact our support team at 
              <a href="mailto:support@citclrs.edu" style="color: #c62828; text-decoration: none; font-weight: 600;">support@citclrs.edu</a>
            </p>
          </div>

        </div>

        <!-- Professional Footer -->
        <div style="background: linear-gradient(135deg, #b71c1c 0%, #c62828 100%); padding: 40px 30px; text-align: center;">
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

module.exports = resendOTPTemplate;
