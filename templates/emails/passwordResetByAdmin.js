/**
 * Password Reset by Admin Email Template
 * Notifies a user that an administrator/custodian has reset their password
 * Reuses the same overall design as the welcome/OTP email.
 */

const passwordResetByAdminTemplate = (firstName, tempPassword) => {
  const safeName = firstName || 'CLRS User';
  const subject = 'Password Reset Notification - Computer Lab Reporting System';

  const text = `Hello ${safeName}!\n\nYour password for the Computer Lab Reporting System has been reset by an administrator.\n\nYour new temporary password is: ${tempPassword}\n\nFor your security, please log in as soon as possible and change this password from your profile settings.\n\nIf you did not request or expect this change, please contact your lab custodian or administrator immediately.\n\nThank you,\nCLRS Backend System`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Notification - CIT CLRS</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header (same design family as welcome email) -->
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px 20px; text-align: center;">
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

        <!-- Main Content -->
        <div style="padding: 40px 30px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e3c72; margin-bottom: 10px; font-size: 24px; font-weight: 600;">Your Password Has Been Reset</h2>
            <div style="width: 120px; height: 2px; background-color: #2196F3; margin: 0 auto;"></div>
          </div>

          <p style="color: #555; line-height: 1.8; margin-bottom: 20px; font-size: 16px;">
            Hello <strong style="color: #1e3c72;">${safeName}</strong>,
          </p>
          <p style="color: #555; line-height: 1.8; margin-bottom: 20px; font-size: 16px;">
            This is a notification from the <strong>Computer Laboratory Reporting System (CLRS)</strong> that your account password has been reset by an authorized administrator or lab custodian.
          </p>

          <!-- Temporary Password Box -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; margin: 30px 0; border-radius: 15px; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3); border: 1px solid rgba(255,255,255,0.1);">
            <p style="color: rgba(255,255,255,0.9); margin: 0 0 10px 0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
              Your New Temporary Password
            </p>
            <h1 style="color: white; font-size: 32px; margin: 10px 0 0 0; letter-spacing: 4px; font-weight: bold; text-shadow: 0 4px 8px rgba(0,0,0,0.3); font-family: 'Courier New', monospace;">
              ${tempPassword}
            </h1>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">
                Please log in using this password and change it immediately from your profile settings.
              </p>
            </div>
          </div>

          <!-- Security Notice -->
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%); border-left: 5px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(76, 175, 80, 0.1);">
            <div style="display: flex; align-items: flex-start;">
              <span style="font-size: 20px; margin-right: 10px; margin-top: 2px;">🔒</span>
              <div>
                <p style="margin: 0 0 8px 0; color: #2e7d32; font-weight: 600; font-size: 16px;">Security Reminder</p>
                <p style="margin: 0; color: #388e3c; font-size: 14px; line-height: 1.6;">
                  For your protection, do not share this password with anyone. After you log in, we strongly recommend that you change this temporary password to something only you know.
                </p>
              </div>
            </div>
          </div>

          <!-- Unexpected Change Notice -->
          <div style="background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%); border-left: 5px solid #ffa726; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(255, 167, 38, 0.1);">
            <div style="display: flex; align-items: flex-start;">
              <span style="font-size: 22px; margin-right: 10px; margin-top: 2px;">⚠️</span>
              <div>
                <p style="margin: 0 0 8px 0; color: #ef6c00; font-weight: 600; font-size: 16px;">Didn\'t expect this change?</p>
                <p style="margin: 0; color: #ef6c00; font-size: 14px; line-height: 1.6;">
                  If you did not request or authorize this password reset, please contact your lab custodian or system administrator immediately so they can secure your account.
                </p>
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <div style="text-align: center; margin: 35px 0 10px 0;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Need help? Contact our support team at
              <a href="mailto:support@citclrs.edu" style="color: #2196F3; text-decoration: none; font-weight: 600;">support@citclrs.edu</a>
            </p>
          </div>
        </div>

        <!-- Footer (same style family as welcome email) -->
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

module.exports = passwordResetByAdminTemplate;
