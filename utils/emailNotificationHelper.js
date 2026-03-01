/**
 * ===========================================
 * EMAIL NOTIFICATION HELPER
 * ===========================================
 * Utility functions for sending email notifications for report-related events
 */

const { sendEmail } = require('./emailService');
const { User } = require('../models');

/**
 * Send email notification for new report submission
 * @param {Object} report - The created report object
 * @param {Object} reporter - User who created the report
 * @param {Object} laboratory - Laboratory where report was submitted
 */
const sendReportSubmissionEmails = async (report, reporter, laboratory) => {
  try {
    console.log('📧 Sending report submission emails...');

    // 1. Send confirmation email to the reporter (student/faculty)
    const reporterEmailContent = {
      subject: `Report Submitted Successfully - ${laboratory.labName}`,
      text: `
Hello ${reporter.fullName},

Your report has been successfully submitted for ${laboratory.labName}.

Report Details:
- Laboratory: ${laboratory.labName} (${laboratory.labCode})
- Location: ${laboratory.location}
- Workstation: ${report.workstationNumber || 'Not specified'}
- Issue Category: ${report.issueCategory}
- Description: ${report.description}
- Status: ${report.status}
- Submitted: ${new Date(report.createdAt).toLocaleString()}

Our lab custodians will review your report and update you on the progress.

Thank you for helping us maintain our laboratory facilities.

Best regards,
CIT CLRS Backend System
      `.trim(),
      html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Report Submitted Successfully - CIT CLRS</title>
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
          
          <!-- Success Message -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e3c72; margin-bottom: 10px; font-size: 24px; font-weight: 600;">✅ Report Submitted Successfully!</h2>
            <div style="width: 120px; height: 2px; background-color: #2196F3; margin: 0 auto;"></div>
          </div>
          
          <!-- Personal Greeting -->
          <div style="background-color: #f8fffe; border-left: 4px solid #00c853; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2e7d32; font-size: 16px; font-weight: 500;">
              Hello <strong>${reporter.fullName}</strong>! 👋
            </p>
            <p style="margin: 10px 0 0 0; color: #388e3c; font-size: 14px;">
              Your report has been successfully submitted for <strong>${laboratory.labName}</strong>.
            </p>
          </div>
          
          <!-- Report Details -->
          <div style="background-color: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #1e3c72; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
              📊 Report Details
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600; width: 130px;">Laboratory:</td>
                <td style="padding: 8px 0; color: #333;">${laboratory.labName} (${laboratory.labCode})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Location:</td>
                <td style="padding: 8px 0; color: #333;">${laboratory.location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Workstation:</td>
                <td style="padding: 8px 0; color: #333;">${report.workstationNumber || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Issue Category:</td>
                <td style="padding: 8px 0; color: #333;">
                  <span style="background: #ff6f00; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                    ${report.issueCategory}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Description:</td>
                <td style="padding: 8px 0; color: #333;">${report.description}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Status:</td>
                <td style="padding: 8px 0; color: #333;">
                  <span style="background: #ffc107; color: #856404; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                    ${report.status.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Submitted:</td>
                <td style="padding: 8px 0; color: #333;">${new Date(report.createdAt).toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <!-- Next Steps -->
          <div style="background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #1565c0; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">What happens next? 🔄</h4>
            <p style="color: #1976d2; margin: 0; font-size: 14px; line-height: 1.6;">
              Our lab custodians will review your report and update you on the progress. You will receive email notifications when there are updates to your report status.
            </p>
          </div>
          
          <!-- Thank You -->
          <div style="text-align: center; margin: 35px 0;">
            <p style="color: #1e3c72; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
              Thank you for helping us maintain our laboratory facilities! 🙏
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
      `.trim()
    };

    // Send email to reporter
    await sendEmail(
      reporter.email,
      reporterEmailContent.subject,
      reporterEmailContent.text,
      reporterEmailContent.html
    );

    console.log(`✅ Confirmation email sent to reporter: ${reporter.email}`);

    // 2. Send notification emails to custodians and admins
    const custodians = await User.find({
      role: { $in: ['lab_custodian', 'admin'] },
      isEmailVerified: true
    }).select('fullName email role');

    console.log(`📋 Found ${custodians.length} custodians/admins to notify`);

    const custodianEmailContent = {
      subject: `🚨 New Report Submitted - ${laboratory.labName} (${report.issueCategory})`,
      text: `
Hello,

A new report has been submitted that requires your attention.

Reporter: ${reporter.fullName} (${reporter.email})
Role: ${reporter.role}

Report Details:
- Laboratory: ${laboratory.labName} (${laboratory.labCode})
- Location: ${laboratory.location}
- Workstation: ${report.workstationNumber || 'Not specified'}
- Issue Category: ${report.issueCategory}
- Description: ${report.description}
- Status: ${report.status}
- Submitted: ${new Date(report.createdAt).toLocaleString()}

Please review this report and take appropriate action.

Best regards,
CIT CLRS Backend System
      `.trim(),
      html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Report Submitted - CIT CLRS</title>
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
          
          <!-- Urgent Alert -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #d32f2f; margin-bottom: 10px; font-size: 24px; font-weight: 600;">🚨 New Report Submitted</h2>
            <div style="width: 120px; height: 2px; background-color: #f44336; margin: 0 auto;"></div>
          </div>
          
          <!-- Alert Message -->
          <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #e65100; font-size: 16px; font-weight: 600;">
              ⚠️ A new report requires your attention
            </p>
            <p style="margin: 10px 0 0 0; color: #f57c00; font-size: 14px;">
              Please review this report and take appropriate action.
            </p>
          </div>
          
          <!-- Reporter Information -->
          <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #1e3c72; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              👤 Reporter Information
            </h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 5px 0; color: #666; font-weight: 600; width: 80px;">Name:</td>
                <td style="padding: 5px 0; color: #333;">${reporter.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666; font-weight: 600;">Email:</td>
                <td style="padding: 5px 0; color: #333;">${reporter.email}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #666; font-weight: 600;">Role:</td>
                <td style="padding: 5px 0; color: #333;">
                  <span style="background: #2196f3; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; text-transform: capitalize;">
                    ${reporter.role}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Report Details -->
          <div style="background-color: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #1e3c72; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
              📊 Report Details
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600; width: 130px;">Laboratory:</td>
                <td style="padding: 8px 0; color: #333;">${laboratory.labName} (${laboratory.labCode})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Location:</td>
                <td style="padding: 8px 0; color: #333;">${laboratory.location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Workstation:</td>
                <td style="padding: 8px 0; color: #333;">${report.workstationNumber || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Issue Category:</td>
                <td style="padding: 8px 0; color: #333;">
                  <span style="background: #f44336; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                    ${report.issueCategory}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Description:</td>
                <td style="padding: 8px 0; color: #333;">${report.description}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Status:</td>
                <td style="padding: 8px 0; color: #333;">
                  <span style="background: #ffc107; color: #856404; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                    ${report.status.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Submitted:</td>
                <td style="padding: 8px 0; color: #333;">${new Date(report.createdAt).toLocaleString()}</td>
              </tr>
            </table>
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
      `.trim()
    };

    // Send emails to all custodians and admins
    const custodianEmailPromises = custodians.map(async (custodian) => {
      try {
        await sendEmail(
          custodian.email,
          custodianEmailContent.subject,
          custodianEmailContent.text,
          custodianEmailContent.html
        );
        console.log(`✅ Notification email sent to custodian: ${custodian.email}`);
        return { success: true, email: custodian.email };
      } catch (error) {
        console.error(`❌ Failed to send email to custodian ${custodian.email}:`, error.message);
        return { success: false, email: custodian.email, error: error.message };
      }
    });

    const custodianEmailResults = await Promise.all(custodianEmailPromises);
    
    const successCount = custodianEmailResults.filter(result => result.success).length;
    console.log(`📧 Custodian email results: ${successCount}/${custodians.length} sent successfully`);

    return {
      reporterEmail: { success: true, email: reporter.email },
      custodianEmails: custodianEmailResults
    };

  } catch (error) {
    console.error('❌ Error sending report submission emails:', error);
    throw error;
  }
};

/**
 * Send email notification for report status updates
 * @param {Object} report - The updated report object
 * @param {string} newStatus - New status of the report
 * @param {Object} custodian - Custodian who made the update
 * @param {string} note - Optional note from custodian
 */
const sendReportStatusUpdateEmail = async (report, newStatus, custodian, note = '') => {
  try {
    console.log('📧 Sending report status update email...');

    // Get the reporter's information
    const reporter = await User.findById(report.reporterId).select('fullName email role');
    if (!reporter) {
      throw new Error('Reporter not found');
    }

    // Determine status color and icon
    let statusColor = '#6c757d';
    let statusIcon = '📋';
    
    switch (newStatus) {
      case 'verified':
        statusColor = '#ffc107';
        statusIcon = '✅';
        break;
      case 'in_progress':
        statusColor = '#17a2b8';
        statusIcon = '⚙️';
        break;
      case 'resolved':
        statusColor = '#28a745';
        statusIcon = '✅';
        break;
      case 'closed':
        statusColor = '#6c757d';
        statusIcon = '🔒';
        break;
    }

    const emailContent = {
      subject: `Report Status Updated: ${newStatus} - ${report.labNameCache}`,
      text: `
Hello ${reporter.fullName},

Your report status has been updated by ${custodian.fullName}.

Updated Report Details:
- Laboratory: ${report.labNameCache}
- Workstation: ${report.workstationNumber || 'Not specified'}
- Issue Category: ${report.issueCategory}
- New Status: ${newStatus}
- Updated by: ${custodian.fullName} (${custodian.role})
- Updated on: ${new Date().toLocaleString()}

${note ? `Custodian Note: ${note}` : ''}

${newStatus === 'resolved' ? 'Your issue has been resolved! Please verify that the problem is fixed.' : ''}
${newStatus === 'closed' ? 'This report has been closed. If you still experience issues, please submit a new report.' : ''}

Thank you for your patience.

Best regards,
CIT CLRS Backend System
      `.trim(),
      html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Report Status Updated - CIT CLRS</title>
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
          
          <!-- Status Update Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e3c72; margin-bottom: 10px; font-size: 24px; font-weight: 600;">${statusIcon} Report Status Updated</h2>
            <div style="width: 120px; height: 2px; background-color: ${statusColor}; margin: 0 auto;"></div>
          </div>
          
          <!-- Personal Greeting -->
          <div style="background-color: #f3e5f5; border-left: 4px solid ${statusColor}; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #4a148c; font-size: 16px; font-weight: 500;">
              Hello <strong>${reporter.fullName}</strong>! 👋
            </p>
            <p style="margin: 10px 0 0 0; color: #6a1b9a; font-size: 14px;">
              Your report status has been updated by <strong>${custodian.fullName}</strong>.
            </p>
          </div>
          
          <!-- Status Change -->
          <div style="background-color: #e8f5e8; border: 1px solid ${statusColor}; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
            <h3 style="color: #1e3c72; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📊 Status Change</h3>
            <p style="margin: 10px 0;">
              Status changed to: 
              <strong style="background: ${statusColor}; color: white; padding: 6px 16px; border-radius: 25px; font-size: 14px;">
                ${newStatus.toUpperCase()}
              </strong>
            </p>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">
              Updated by ${custodian.fullName} (${custodian.role}) on ${new Date().toLocaleString()}
            </p>
          </div>
          
          <!-- Report Details -->
          <div style="background-color: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #1e3c72; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">📋 Report Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600; width: 130px;">Laboratory:</td>
                <td style="padding: 8px 0; color: #333;">${report.labNameCache}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Workstation:</td>
                <td style="padding: 8px 0; color: #333;">${report.workstationNumber || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Issue Category:</td>
                <td style="padding: 8px 0; color: #333;">${report.issueCategory}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Description:</td>
                <td style="padding: 8px 0; color: #333;">${report.description}</td>
              </tr>
            </table>
          </div>
          
          ${note ? `<div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #e65100; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">📝 Custodian Note</h4>
            <p style="color: #ef6c00; margin: 0; font-size: 14px; line-height: 1.6;">${note}</p>
          </div>` : ''}
          
          ${newStatus === 'resolved' ? '<div style="background-color: #e8f5e8; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;"><h4 style="color: #2e7d32; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">✅ Issue Resolved!</h4><p style="color: #388e3c; margin: 0; font-size: 14px;">Your issue has been resolved! Please verify that the problem is fixed.</p></div>' : ''}
          
          ${newStatus === 'closed' ? '<div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;"><h4 style="color: #c62828; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">🔒 Report Closed</h4><p style="color: #d32f2f; margin: 0; font-size: 14px;">This report has been closed. If you still experience issues, please submit a new report.</p></div>' : ''}
          
          <!-- Thank You -->
          <div style="text-align: center; margin: 35px 0;">
            <p style="color: #1e3c72; font-size: 16px; margin: 0; font-weight: 600;">
              Thank you for your patience! 🙏
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
      `.trim()
    };

    await sendEmail(
      reporter.email,
      emailContent.subject,
      emailContent.text,
      emailContent.html
    );

    console.log(`✅ Status update email sent to reporter: ${reporter.email}`);

    return { success: true, email: reporter.email };

  } catch (error) {
    console.error('❌ Error sending status update email:', error);
    throw error;
  }
};

/**
 * Send email notification when custodian adds a note
 * @param {Object} report - The report object
 * @param {string} note - The custodian note
 * @param {Object} custodian - Custodian who added the note
 */
const sendCustodianNoteEmail = async (report, note, custodian) => {
  try {
    console.log('📧 Sending custodian note email...');

    // Get the reporter's information
    const reporter = await User.findById(report.reporterId).select('fullName email role');
    if (!reporter) {
      throw new Error('Reporter not found');
    }

    const emailContent = {
      subject: `Progress Update on Your Report - ${report.labNameCache}`,
      text: `
Hello ${reporter.fullName},

${custodian.fullName} has added a progress update to your report.

Report Details:
- Laboratory: ${report.labNameCache}
- Workstation: ${report.workstationNumber || 'Not specified'}
- Issue Category: ${report.issueCategory}
- Current Status: ${report.status}

Progress Update:
${note}

Updated by: ${custodian.fullName} (${custodian.role})
Updated on: ${new Date().toLocaleString()}

We will continue to keep you informed of any progress.

Best regards,
CIT CLRS Backend System
      `.trim(),
      html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Progress Update - CIT CLRS</title>
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
          
          <!-- Progress Update Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e3c72; margin-bottom: 10px; font-size: 24px; font-weight: 600;">📝 Progress Update on Your Report</h2>
            <div style="width: 120px; height: 2px; background-color: #17a2b8; margin: 0 auto;"></div>
          </div>
          
          <!-- Personal Greeting -->
          <div style="background-color: #e0f7fa; border-left: 4px solid #17a2b8; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #00695c; font-size: 16px; font-weight: 500;">
              Hello <strong>${reporter.fullName}</strong>! 👋
            </p>
            <p style="margin: 10px 0 0 0; color: #00838f; font-size: 14px;">
              <strong>${custodian.fullName}</strong> has added a progress update to your report.
            </p>
          </div>
          
          <!-- Report Details -->
          <div style="background-color: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #1e3c72; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">📋 Report Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600; width: 130px;">Laboratory:</td>
                <td style="padding: 8px 0; color: #333;">${report.labNameCache}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Workstation:</td>
                <td style="padding: 8px 0; color: #333;">${report.workstationNumber || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Issue Category:</td>
                <td style="padding: 8px 0; color: #333;">${report.issueCategory}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 600;">Current Status:</td>
                <td style="padding: 8px 0; color: #333;">
                  <span style="background: #6c757d; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                    ${report.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Progress Update -->
          <div style="background-color: #e1f5fe; border-left: 4px solid #17a2b8; padding: 25px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #0277bd; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🔄 Progress Update</h3>
            <p style="color: #01579b; margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; background-color: white; padding: 15px; border-radius: 8px;">
              ${note}
            </p>
            <p style="margin: 0; color: #0288d1; font-size: 12px;">
              <strong>Updated by:</strong> ${custodian.fullName} (${custodian.role})<br>
              <strong>Updated on:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          
          <!-- Continued Updates -->
          <div style="text-align: center; margin: 35px 0;">
            <p style="color: #1e3c72; font-size: 16px; margin: 0; font-weight: 600;">
              We will continue to keep you informed of any progress! 🔄
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
      `.trim()
    };

    await sendEmail(
      reporter.email,
      emailContent.subject,
      emailContent.text,
      emailContent.html
    );

    console.log(`✅ Custodian note email sent to reporter: ${reporter.email}`);

    return { success: true, email: reporter.email };

  } catch (error) {
    console.error('❌ Error sending custodian note email:', error);
    throw error;
  }
};

module.exports = {
  sendReportSubmissionEmails,
  sendReportStatusUpdateEmail,
  sendCustodianNoteEmail
};
