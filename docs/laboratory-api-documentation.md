# Laboratory API Documentation

## Overview

The Laboratory API provides endpoints for managing laboratory information in the CIT CLRS system. It includes full CRUD operations with role-based access control and automatic synchronization with report data.

## Base URL
```
/api/laboratories
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Role-Based Access Control

| Role | Create | Read | Update | Delete | Stats |
|------|--------|------|--------|--------|-------|
| Student | ❌ | ✅ | ❌ | ❌ | ❌ |
| Faculty | ❌ | ✅ | ❌ | ❌ | ❌ |
| Lab Custodian | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Endpoints

### 1. Create Laboratory

**POST** `/api/laboratories`

Creates a new laboratory with automatic validation and uniqueness checks.

#### Access
- **Roles**: Admin, Lab Custodian
- **Authentication**: Required

#### Request Body
```json
{
  "labCode": "CSLAB01",
  "labName": "Computer Science Laboratory 1",
  "location": "Building A, Floor 2",
  "description": "Main computer laboratory for CS courses",
  "numberOfWorkstations": 30
}
```

#### Required Fields
- `labCode` (string): Unique laboratory code
- `labName` (string): Laboratory name

#### Optional Fields
- `location` (string): Physical location
- `description` (string): Laboratory description
- `numberOfWorkstations` (number): Number of workstations (default: 0)

#### Response
```json
{
  "success": true,
  "message": "Laboratory created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "labCode": "CSLAB01",
    "labName": "Computer Science Laboratory 1",
    "location": "Building A, Floor 2",
    "description": "Main computer laboratory for CS courses",
    "numberOfWorkstations": 30,
    "isActive": true,
    "createdAt": "2026-02-23T10:30:00.000Z",
    "updatedAt": "2026-02-23T10:30:00.000Z"
  }
}
```

#### Error Responses
```json
// Validation Error
{
  "success": false,
  "message": "Lab code and lab name are required"
}

// Duplicate Lab Code
{
  "success": false,
  "message": "A laboratory with this code already exists"
}

// Duplicate Lab Name
{
  "success": false,
  "message": "A laboratory with this name already exists"
}

// Invalid Workstations
{
  "success": false,
  "message": "Number of workstations must be 0 or greater"
}
```

---

### 2. Get All Laboratories

**GET** `/api/laboratories`

Retrieves all laboratories with optional filtering and sorting.

#### Access
- **Roles**: All authenticated users
- **Authentication**: Required

#### Query Parameters
- `includeInactive` (boolean): Include inactive labs (default: false)
- `sortBy` (string): Field to sort by (default: "labCode")
- `sortOrder` (string): "asc" or "desc" (default: "asc")
- `search` (string): Search in labCode, labName, or location

#### Examples
```
GET /api/laboratories
GET /api/laboratories?search=computer
GET /api/laboratories?sortBy=labName&sortOrder=desc
GET /api/laboratories?includeInactive=true
```

#### Response
```json
{
  "success": true,
  "message": "Found 3 laboratories",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "labCode": "CSLAB01",
      "labName": "Computer Science Laboratory 1",
      "location": "Building A, Floor 2",
      "description": "Main computer laboratory for CS courses",
      "numberOfWorkstations": 30,
      "isActive": true,
      "reportCount": 15,
      "activeReportCount": 3,
      "createdAt": "2026-02-23T10:30:00.000Z",
      "updatedAt": "2026-02-23T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Laboratory by ID

**GET** `/api/laboratories/:id`

Retrieves detailed information about a specific laboratory including report statistics.

#### Access
- **Roles**: All authenticated users
- **Authentication**: Required

#### URL Parameters
- `id` (string): Laboratory ObjectId

#### Response
```json
{
  "success": true,
  "message": "Laboratory retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "labCode": "CSLAB01",
    "labName": "Computer Science Laboratory 1",
    "location": "Building A, Floor 2",
    "description": "Main computer laboratory for CS courses",
    "numberOfWorkstations": 30,
    "isActive": true,
    "reportCount": 15,
    "recentReports": [
      {
        "id": "507f1f77bcf86cd799439012",
        "description": "Monitor flickering",
        "status": "Submitted",
        "reporterId": {
          "fullName": "John Doe",
          "email": "john.doe@example.com"
        }
      }
    ],
    "reportStats": [
      { "_id": "Submitted", "count": 5 },
      { "_id": "In Progress", "count": 2 },
      { "_id": "Resolved", "count": 8 }
    ],
    "workstationNumbers": ["1", "2", "3", "..."],
    "createdAt": "2026-02-23T10:30:00.000Z",
    "updatedAt": "2026-02-23T10:30:00.000Z"
  }
}
```

#### Error Responses
```json
// Invalid ID Format
{
  "success": false,
  "message": "Invalid laboratory ID format"
}

// Not Found
{
  "success": false,
  "message": "Laboratory not found"
}
```

---

### 4. Update Laboratory

**PUT** `/api/laboratories/:id`

Updates laboratory information with automatic report synchronization.

#### Access
- **Roles**: Admin, Lab Custodian
- **Authentication**: Required

#### URL Parameters
- `id` (string): Laboratory ObjectId

#### Request Body
```json
{
  "labCode": "CSLAB01_UPDATED",
  "labName": "Updated Computer Science Laboratory 1",
  "location": "Building B, Floor 3",
  "description": "Updated description",
  "numberOfWorkstations": 35
}
```

#### Auto-Sync Behavior
- If `labName` is changed, all related Report documents are automatically updated
- The `labNameCache` field in reports is synchronized with the new lab name
- Sync logic runs after successful update

#### Response
```json
{
  "success": true,
  "message": "Laboratory updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "labCode": "CSLAB01_UPDATED",
    "labName": "Updated Computer Science Laboratory 1",
    "location": "Building B, Floor 3",
    "description": "Updated description",
    "numberOfWorkstations": 35,
    "isActive": true,
    "createdAt": "2026-02-23T10:30:00.000Z",
    "updatedAt": "2026-02-23T11:45:00.000Z"
  }
}
```

#### Error Responses
```json
// Validation Error
{
  "success": false,
  "message": "Lab name cannot be empty"
}

// Duplicate Code/Name
{
  "success": false,
  "message": "A laboratory with this code already exists"
}

// Invalid Workstations
{
  "success": false,
  "message": "Number of workstations must be 0 or greater"
}
```

---

### 5. Delete Laboratory (Soft Delete)

**DELETE** `/api/laboratories/:id`

Soft deletes a laboratory by setting `isActive = false`. Reports remain unchanged for historical purposes.

#### Access
- **Roles**: Admin, Lab Custodian
- **Authentication**: Required

#### URL Parameters
- `id` (string): Laboratory ObjectId

#### Behavior
- Sets `isActive` to `false`
- Reports linked to this lab remain intact
- Lab becomes hidden from active listings
- Warns about active reports if any exist

#### Response
```json
{
  "success": true,
  "message": "Laboratory deactivated successfully. Note: 3 active reports remain associated with this laboratory.",
  "data": {
    "laboratory": {
      "id": "507f1f77bcf86cd799439011",
      "labCode": "CSLAB01",
      "labName": "Computer Science Laboratory 1",
      "isActive": false,
      "updatedAt": "2026-02-23T12:00:00.000Z"
    },
    "activeReportsCount": 3
  }
}
```

#### Error Responses
```json
// Already Inactive
{
  "success": false,
  "message": "Laboratory is already inactive"
}

// Not Found
{
  "success": false,
  "message": "Laboratory not found"
}
```

---

### 6. Get Laboratory Statistics

**GET** `/api/laboratories/admin/stats`

Retrieves comprehensive statistics about laboratories and their reports.

#### Access
- **Roles**: Admin, Lab Custodian
- **Authentication**: Required

#### Response
```json
{
  "success": true,
  "message": "Laboratory statistics retrieved successfully",
  "data": {
    "summary": {
      "totalLabs": 10,
      "activeLabs": 8,
      "inactiveLabs": 2
    },
    "topLabsByReports": [
      {
        "id": "507f1f77bcf86cd799439011",
        "labCode": "CSLAB01",
        "labName": "Computer Science Laboratory 1",
        "isActive": true,
        "totalReports": 25,
        "activeReports": 5
      }
    ]
  }
}
```

---

### 7. Reactivate Laboratory

**PATCH** `/api/laboratories/:id/reactivate`

Reactivates a soft-deleted laboratory by setting `isActive = true`.

#### Access
- **Roles**: Admin only
- **Authentication**: Required

#### URL Parameters
- `id` (string): Laboratory ObjectId

#### Response
```json
{
  "success": true,
  "message": "Laboratory reactivated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "labCode": "CSLAB01",
    "labName": "Computer Science Laboratory 1",
    "isActive": true,
    "updatedAt": "2026-02-23T12:30:00.000Z"
  }
}
```

---

## Error Handling

### Common Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Data Synchronization

### Auto-Sync Logic
When a laboratory's `labName` is updated:

1. **Trigger**: PUT request to `/api/laboratories/:id` with new `labName`
2. **Update**: Laboratory document is updated
3. **Sync**: All Report documents with matching `labId` are updated
4. **Result**: `labNameCache` in reports matches new laboratory name

### Sync Implementation
```javascript
await Report.updateMany(
  { labId: updatedLab._id },
  { $set: { labNameCache: updatedLab.labName } }
)
```

### Sync Logging
Server logs show sync operations:
```
✅ Synced labNameCache for 15 reports after lab name change
```

---

## Usage Examples

### Create a Laboratory
```javascript
const response = await fetch('/api/laboratories', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    labCode: 'NEWLAB01',
    labName: 'New Laboratory',
    numberOfWorkstations: 25
  })
});
```

### Get All Laboratories
```javascript
const response = await fetch('/api/laboratories?search=computer', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

### Update Laboratory
```javascript
const response = await fetch('/api/laboratories/507f1f77bcf86cd799439011', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    labName: 'Updated Laboratory Name'
  })
});
```

---

## Testing

Use the provided test script to verify all functionality:

```bash
# Install dependencies
npm install axios

# Run tests
node test-laboratory-module.js --run
```

The test script covers:
- Authentication setup
- Laboratory CRUD operations
- Role-based access control
- Data synchronization
- Error handling
- Statistics endpoints
