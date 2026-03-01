# 📧 Email Notification System Documentation

## Overview

The CLRS Laboratory Management System now includes a comprehensive email notification system that automatically sends professional emails to users when important report-related events occur.

## 🎯 Key Features

### **1. Report Submission Notifications**
- **Reporter**: Receives confirmation email with report details
- **Custodians & Admins**: Receive notification about new reports requiring attention

### **2. Status Update Notifications**
- **Reporter**: Receives email when custodians update report status
- **Dynamic Content**: Status-specific messages and visual indicators

### **3. Custodian Note Notifications**
- **Reporter**: Receives email when custodians add progress notes
- **Context**: Full note content with custodian identity

## 📬 Email Types & Templates

### **Report Submission Email (to Reporter)**
```
Subject: Report Submitted Successfully - [Lab Name]

Features:
✅ Professional HTML template with CLRS branding
✅ Complete report details summary
✅ Confirmation of successful submission
✅ What happens next information
✅ Responsive design for mobile devices
```

### **New Report Alert (to Custodians)**
```
Subject: New Report Submitted - [Lab Name] ([Issue Category])

Features:
🚨 Urgent styling to grab attention
👤 Complete reporter information
📊 Detailed report breakdown
⚠️ Clear call-to-action for review
```

### **Status Update Email (to Reporter)**
```
Subject: Report Status Updated: [New Status] - [Lab Name]

Features:
📊 Status change visualization with colors
📝 Optional custodian notes included
✅ Status-specific congratulations/instructions
🎨 Dynamic color scheme based on status
```

### **Custodian Note Email (to Reporter)**
```
Subject: Progress Update on Your Report - [Lab Name]

Features:
🔄 Progress update formatting
📝 Full note content display
👨‍🔬 Custodian identity and role
📅 Timestamp information
```

## 🔧 Technical Implementation

### **Email Service Integration**
```javascript
// Uses existing emailService.js with SendGrid integration
const { sendEmail } = require('./emailService');

// Supports both HTML and plain text formats
await sendEmail(email, subject, textContent, htmlContent);
```

### **Asynchronous Processing**
```javascript
// Emails are sent asynchronously to avoid blocking responses
setImmediate(async () => {
  try {
    await sendReportSubmissionEmails(report, reporter, laboratory);
    console.log('✅ Emails sent successfully');
  } catch (error) {
    console.warn('❌ Email failed, but operation continues');
  }
});
```

### **Error Handling**
- Email failures don't block main operations
- Comprehensive logging for debugging
- Graceful degradation when email service is unavailable

## 📋 Integration Points

### **Report Controller Updates**

#### **createReport Function**
```javascript
// After successful report creation
await sendReportSubmissionEmails(report, req.user, laboratory);
```

#### **updateReportStatus Function**
```javascript
// After status update
await sendReportStatusUpdateEmail(updatedReport, newStatus, req.user, note);
```

#### **addCustodianNote Function**
```javascript
// After adding custodian note
await sendCustodianNoteEmail(updatedReport, note, req.user);
```

## 🎨 Email Templates

### **HTML Template Features**
- Professional CLRS branding
- Responsive design for all devices
- Status-specific color schemes
- Clear visual hierarchy
- Mobile-friendly layout

### **Color Coding by Status**
- **Submitted**: Yellow (`#ffc107`)
- **Verified**: Blue (`#17a2b8`)
- **In Progress**: Info Blue (`#17a2b8`)
- **Resolved**: Green (`#28a745`)
- **Closed**: Gray (`#6c757d`)

## 📊 Recipient Rules

### **Report Submission**
- **Reporter**: ✅ Confirmation email
- **All Lab Custodians**: ✅ New report alert
- **All Admins**: ✅ New report alert

### **Status Updates**
- **Reporter Only**: ✅ Status change notification

### **Custodian Notes**
- **Reporter Only**: ✅ Progress update notification

## 🛡️ Security & Privacy

### **User Verification**
- Only sends emails to verified email addresses (`isEmailVerified: true`)
- Automatic filtering of inactive accounts

### **Data Protection**
- No sensitive passwords or tokens in emails
- Report IDs are included but not clickable (no direct links)
- Professional, informative content only

## 🚀 Usage Examples

### **Testing the System**
```bash
# Run the email notification test script
node test-email-notifications.js
```

### **Manual Testing**
```javascript
const { sendReportSubmissionEmails } = require('./utils/emailNotificationHelper');

// Test report submission emails
await sendReportSubmissionEmails(reportObject, userObject, laboratoryObject);
```

## 📈 Monitoring & Logging

### **Success Logging**
```
✅ Confirmation email sent to reporter: user@example.com
✅ Notification email sent to custodian: custodian@example.com
📧 Custodian email results: 3/3 sent successfully
```

### **Error Logging**
```
❌ Failed to send email to custodian user@example.com: [error details]
❌ Failed to send report submission emails: [error details]
```

## 🔄 Workflow Examples

### **Complete Report Lifecycle**

1. **Student submits report**
   - Student receives: Confirmation email
   - Custodians receive: New report alert

2. **Custodian verifies report**
   - Student receives: Status update email ("Verified by Lab Custodian")

3. **Custodian adds progress note**
   - Student receives: Progress update email with note content

4. **Custodian marks as "In Progress"**
   - Student receives: Status update email ("In Progress")

5. **Custodian resolves issue**
   - Student receives: Resolution email ("Resolved")

6. **Custodian closes report**
   - Student receives: Closure email ("Closed")

## 💡 Future Enhancements

### **Potential Additions**
- Email preferences for users (frequency, types)
- Digest emails for multiple reports
- Email templates customization
- SMS notifications for urgent issues
- Email tracking and analytics

## 🏆 Benefits

### **For Students/Faculty**
- ✅ Always informed about report progress
- ✅ Professional communication experience
- ✅ Clear expectations about next steps
- ✅ Historical record of communications

### **For Custodians/Admins**
- ✅ Immediate notification of new reports
- ✅ Automatic notification distribution
- ✅ Professional communication templates
- ✅ Reduced manual notification overhead

### **For the System**
- ✅ Enhanced user engagement
- ✅ Improved communication tracking
- ✅ Professional institutional image
- ✅ Automated workflow management

## 📞 Support

The email notification system is fully integrated with the existing CLRS backend and uses the same SendGrid configuration. All email functionality is asynchronous and won't affect the performance of the main application.

**Email Service Status**: Ready for production use ✅
**Templates**: Professional HTML + Plain Text ✅
**Error Handling**: Comprehensive with graceful degradation ✅
**Testing**: Full test suite available ✅
