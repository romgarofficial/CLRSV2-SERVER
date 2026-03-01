# Assets Folder

This folder contains static assets used by the CIT CLRS backend system.

## 📁 Contents

### Logo Files
- `citclslogo.png` - Main CIT CLRS logo used in email templates
  - **Format**: PNG with transparent background
  - **Recommended size**: 200x200px or similar square ratio
  - **Usage**: Embedded in email templates as inline attachment
  - **Content ID**: `citclslogo` (used in email HTML as `cid:citclslogo`)

### File Requirements

#### Logo Specifications
- **File name**: Must be exactly `citclslogo.png`
- **Format**: PNG (preferred for transparency)
- **Size**: Maximum 200KB for email compatibility
- **Dimensions**: 200x200px recommended (square aspect ratio)
- **Background**: Transparent or white background
- **Quality**: High resolution for crisp display

## 🔧 Usage in Email Templates

The logo is referenced in email templates using:
```html
<img src="cid:citclslogo" alt="CIT CLRS Logo" style="max-width: 80px; height: auto;" />
```

## 📧 Email Integration

The logo is automatically attached to emails as an inline attachment with:
- **Content ID**: `citclslogo`
- **Disposition**: `inline`
- **MIME Type**: `image/png`

## 🚀 Setup Instructions

1. **Add Logo**: Place your `citclslogo.png` file in this folder
2. **Verify Path**: Ensure the file path matches the configuration in `/utils/emailService.js`
3. **Test Email**: Send a test email to verify the logo displays correctly

## 🔍 Troubleshooting

If logo doesn't display in emails:
1. Check file exists: `assets/citclslogo.png`
2. Verify file permissions are readable
3. Check file size (should be < 200KB)
4. Ensure PNG format
5. Review console logs for attachment warnings

## 📝 Notes

- Logo file is not tracked in Git (add to .gitignore if needed)
- Logo is embedded inline, not hosted externally
- Different email clients may render slightly differently
- Always test with major email providers (Gmail, Outlook, etc.)
