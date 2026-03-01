# Email Templates

This folder contains all email templates used by the CLRS backend system.

## 📁 Folder Structure

```
templates/
└── emails/
    ├── index.js           # Main export file for all email templates
    ├── welcomeOTP.js      # Welcome email with OTP verification
    ├── resendOTP.js       # Resend OTP email template
    └── README.md          # This documentation file
```

## 📧 Available Templates

### 1. Welcome OTP Template (`welcomeOTP.js`)
**Purpose**: Sent during user registration with email verification OTP
**Function**: `welcomeOTPTemplate(firstName, otp)`
**Returns**: `{ subject, text, html }`

**Features**:
- Professional welcome message
- Branded CLRS design
- Prominent OTP display with gradient background
- Security notices and instructions
- Responsive design

### 2. Resend OTP Template (`resendOTP.js`)
**Purpose**: Sent when user requests a new OTP
**Function**: `resendOTPTemplate(firstName, otp)`
**Returns**: `{ subject, text, html }`

**Features**:
- Clear indication it's a new/replacement code
- Security alerts about previous codes being invalidated
- Warning if user didn't request the new code
- Different color scheme (red gradient) to distinguish from welcome email

## 🎨 Design Features

All email templates include:
- **Responsive design** that works on mobile and desktop
- **Professional branding** with CLRS system identity
- **Security notices** to educate users
- **Clear CTA** with prominent OTP display
- **Footer information** with copyright and system details

## 📝 Usage Example

```javascript
// Import templates
const { welcomeOTPTemplate, resendOTPTemplate } = require('../templates/emails');

// Use welcome template
const emailContent = welcomeOTPTemplate('John', '123456');
await sendEmail(user.email, emailContent.subject, emailContent.text, emailContent.html);

// Use resend template
const resendContent = resendOTPTemplate('John', '654321');
await sendEmail(user.email, resendContent.subject, resendContent.text, resendContent.html);
```

## ✨ Template Standards

When creating new email templates, follow these guidelines:

### Structure
- Return object with `{ subject, text, html }`
- Include both plain text and HTML versions
- Use consistent naming convention

### Design
- Use inline CSS for maximum email client compatibility
- Include responsive design principles
- Maintain CLRS branding colors and fonts
- Add security notices where appropriate

### Content
- Keep subject lines under 50 characters
- Use clear, friendly language
- Include expiration times for time-sensitive content
- Add proper footer information

## 🔧 Maintenance

- **Add new templates**: Create new `.js` files and export in `index.js`
- **Update branding**: Modify common elements across all templates
- **Test emails**: Always test with different email clients
- **Version control**: Keep track of template changes for consistency

## 🚀 Future Templates

Planned email templates:
- Password reset
- Account activation/deactivation
- Booking confirmations
- System notifications
- Account security alerts
