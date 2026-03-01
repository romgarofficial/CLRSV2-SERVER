# 📝 POSTMAN SAMPLE REPORT CREATION GUIDE

## Overview
This guide provides step-by-step instructions for creating a sample report using Postman in the CIT CLRS system.

## Prerequisites
1. ✅ **Authentication Required**: You need a valid JWT token
2. ✅ **User Role Required**: student, faculty, lab_custodian, or admin
3. ✅ **Laboratory Exists**: At least one laboratory must exist in the system

---

## 🔑 Step 1: Authentication Setup

### 1.1 Get Authentication Token
First, you need to login and get a JWT token:

**Request:**
```
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Response:** Copy the `token` from the response.

### 1.2 Set Authorization Header
In Postman, go to the **Authorization** tab:
- Type: `Bearer Token`
- Token: `{{your-jwt-token}}`

---

## 🏢 Step 2: Get Laboratory Information (Optional)

Before creating a report, you might want to see available laboratories:

**Request:**
```
GET {{base_url}}/api/laboratories
Authorization: Bearer {{your-jwt-token}}
```

This will show you:
- Laboratory IDs (needed for report creation)
- Lab names, codes, and locations
- Number of workstations available

---

## 📝 Step 3: Create Sample Report

### 3.1 Basic Report Creation (JSON)

**HTTP Method:** `POST`
**URL:** `{{base_url}}/api/reports`
**Headers:**
```
Authorization: Bearer {{your-jwt-token}}
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "labId": "60f1b2c3d4e5f6789a0b1c2d",
  "workstationNumber": 15,
  "issueCategory": "hardware",
  "description": "Computer workstation #15 is experiencing frequent blue screen errors (BSOD). The system crashes approximately every 30 minutes during normal use. This started happening yesterday after the recent Windows updates. Students are unable to complete their programming assignments."
}
```

### 3.2 Report with Images (Form Data)

For uploading images with your report, use **form-data** instead of JSON:

**HTTP Method:** `POST`
**URL:** `{{base_url}}/api/reports`
**Headers:**
```
Authorization: Bearer {{your-jwt-token}}
Content-Type: multipart/form-data
```

**Request Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| `labId` | text | `60f1b2c3d4e5f6789a0b1c2d` |
| `workstationNumber` | text | `15` |
| `issueCategory` | text | `hardware` |
| `description` | text | `Computer workstation #15 is experiencing frequent blue screen errors...` |
| `images` | file | Select image file(s) - Max 5 files, 5MB each |

---

## 🎯 Sample Report Variations

### Hardware Issue Report
```json
{
  "labId": "60f1b2c3d4e5f6789a0b1c2d",
  "workstationNumber": 8,
  "issueCategory": "hardware",
  "description": "Mouse is not working properly on workstation 8. The left click is unresponsive and the scroll wheel is stuck. Students cannot select text or click on menu items effectively."
}
```

### Software Issue Report
```json
{
  "labId": "60f1b2c3d4e5f6789a0b1c2d",
  "workstationNumber": 12,
  "issueCategory": "software",
  "description": "Visual Studio Code is crashing when trying to open large projects on workstation 12. The application fails to load and shows 'Out of memory' error. This affects students working on their final projects."
}
```

### Facility Issue Report
```json
{
  "labId": "60f1b2c3d4e5f6789a0b1c2d",
  "issueCategory": "facility",
  "description": "Air conditioning unit in the computer lab is not working properly. The room temperature is very high (around 85°F), making it uncomfortable for students and potentially harmful to computer equipment."
}
```

### Cleanliness Issue Report
```json
{
  "labId": "60f1b2c3d4e5f6789a0b1c2d",
  "workstationNumber": 3,
  "issueCategory": "cleanliness",
  "description": "Workstation 3 area is very dusty and the keyboard has accumulated debris between keys. The screen also has fingerprints and smudges that affect visibility."
}
```

---

## 📋 Field Requirements & Validation

### Required Fields
- ✅ **labId** (string): Valid MongoDB ObjectId of existing laboratory
- ✅ **issueCategory** (string): Must be one of: `hardware`, `software`, `facility`, `cleanliness`
- ✅ **description** (string): Detailed description of the issue

### Optional Fields
- 🔧 **workstationNumber** (integer): Must be between 1 and max workstations for the lab
- 📸 **images** (files): Up to 5 image files (JPEG, PNG, GIF, WebP), max 5MB each

### Issue Categories Explained
- **hardware**: Physical equipment problems (computers, monitors, keyboards, mice, etc.)
- **software**: Application or operating system issues
- **facility**: Room conditions (AC, lighting, furniture, etc.)
- **cleanliness**: Hygiene and maintenance issues

---

## ✅ Expected Response

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "_id": "60f1b2c3d4e5f6789a0b1c2e",
    "labId": {
      "_id": "60f1b2c3d4e5f6789a0b1c2d",
      "labCode": "CIT-LAB-01",
      "labName": "Computer Programming Laboratory"
    },
    "labNameCache": "Computer Programming Laboratory",
    "workstationNumber": 15,
    "issueCategory": "hardware",
    "description": "Computer workstation #15 is experiencing frequent blue screen errors...",
    "images": [],
    "reporterId": {
      "_id": "60f1b2c3d4e5f6789a0b1c2f",
      "fullName": "John Doe",
      "email": "john.doe@student.edu",
      "role": "student"
    },
    "status": "Submitted",
    "custodianNotes": [],
    "createdAt": "2026-02-23T10:30:00.000Z",
    "updatedAt": "2026-02-23T10:30:00.000Z"
  }
}
```

### Error Response Examples

#### Missing Required Fields (400)
```json
{
  "success": false,
  "message": "Lab ID, issue category, and description are required"
}
```

#### Invalid Laboratory ID (404)
```json
{
  "success": false,
  "message": "Laboratory not found"
}
```

#### Invalid Issue Category (400)
```json
{
  "success": false,
  "message": "Invalid issue category. Allowed values: hardware, software, facility, cleanliness"
}
```

#### Invalid Workstation Number (400)
```json
{
  "success": false,
  "message": "Workstation number must be between 1 and 30"
}
```

#### Authorization Error (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

---

## 🧪 Testing Tips

### 1. Environment Variables
Set up Postman environment variables:
```
base_url: http://localhost:5000
auth_token: {{your-jwt-token}}
lab_id: {{existing-lab-id}}
```

### 2. Collection Setup
Create a Postman collection with:
- Authentication request
- Get laboratories request
- Create report requests (multiple variations)
- Get my reports request (to verify creation)

### 3. Pre-request Scripts
Add this to automatically set the auth token:
```javascript
// Pre-request script to set token
if (pm.globals.get("auth_token")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.globals.get("auth_token")
    });
}
```

### 4. Test Scripts
Add these tests to verify responses:
```javascript
// Test script example
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has success property", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("Report has required fields", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('_id');
    pm.expect(jsonData.data).to.have.property('status');
    pm.expect(jsonData.data.status).to.eql('Submitted');
});
```

---

## 📧 Email Notifications

When a report is successfully created, the system will automatically:

1. ✅ **Send confirmation email to reporter** with report details
2. ✅ **Send alert email to lab custodians and admins** for immediate attention
3. ✅ **Create in-app notifications** for custodians

These emails use professional CIT CLRS branding and include:
- Report details
- Reporter information
- Laboratory information
- Next steps and contact information

---

## 🔄 Next Steps After Creating Report

After successfully creating a report, you can:

1. **View Your Reports**: `GET /api/reports/me`
2. **Check Report Status**: `GET /api/reports/{report-id}`
3. **View Notifications** (if custodian): `GET /api/notifications`

Lab custodians can then:
- Update report status: `PUT /api/reports/{report-id}/status`
- Add progress notes: `POST /api/reports/{report-id}/notes`
- Update report details: `PUT /api/reports/{report-id}`

---

**🎉 You're all set to create sample reports in the CIT CLRS system!**
