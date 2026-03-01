# Laboratory and Report Models Documentation

## Overview

This document describes the Laboratory and Report models for the CIT CLRS (Computer Laboratory Reporting System). These models work together to manage laboratory information and track issue reports with a comprehensive custodian workflow system.

## Models Structure

### 1. Laboratory Model (`/models/Laboratory.js`)

#### Purpose
Manages dynamic laboratory information including lab details, workstation counts, and maintains relationships with reports.

#### Schema Fields

```javascript
{
  labCode: String,           // Required, unique, uppercase
  labName: String,           // Required
  location: String,          // Optional, default: ""
  description: String,       // Optional, default: ""
  numberOfWorkstations: Number, // Default: 0, minimum: 0
  isActive: Boolean,         // Default: true
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

#### Key Features

**Auto-Sync Functionality:**
- When `labName` changes, automatically updates `labNameCache` in all related Report documents
- Uses post-save and post-findOneAndUpdate hooks
- Ensures historical consistency across the system

**Virtual Fields:**
- `fullIdentifier`: Returns "LABCODE - Lab Name" format
- `workstationRange`: Returns "1-N" or "No workstations"

**Instance Methods:**
- `getWorkstationNumbers()`: Returns array of valid workstation numbers
- `isValidWorkstation(number)`: Validates if workstation number is valid for this lab

**Static Methods:**
- `findActive()`: Finds all active laboratories
- `findByCode(code)`: Finds laboratory by code (case-insensitive)

#### Indexes
- `labCode` (unique)
- `labName`
- `isActive`
- `createdAt` (descending)

---

### 2. Report Model (`/models/Report.js`)

#### Purpose
Manages laboratory issue reports with comprehensive custodian tracking, workflow management, and historical data consistency.

#### Schema Fields

```javascript
{
  // Lab Reference
  labId: ObjectId,           // Required, references Laboratory
  labNameCache: String,      // Auto-populated from Laboratory.labName
  
  // Workstation
  workstationNumber: String, // Optional
  
  // Issue Details
  issueCategory: String,     // Required: "hardware", "software", "facility", "cleanliness"
  description: String,       // Required, 10-1000 characters
  images: [String],          // Optional, max 5 images
  
  // Reporter Information
  reporterId: ObjectId,      // Required, references User
  
  // Workflow Status
  status: String,            // "Submitted", "Verified by Lab Custodian", "In Progress", "Resolved", "Closed"
  
  // Custodian Tracking
  updatedByCustodianId: ObjectId, // References User (last custodian who acted)
  custodianNotes: [
    {
      note: String,          // Required
      custodianId: ObjectId, // Required, references User
      createdAt: Date        // Auto-generated
    }
  ],
  
  // System Tracking
  resolvedAt: Date,          // Auto-set when status becomes "Resolved"
  closedAt: Date,            // Auto-set when status becomes "Closed"
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

#### Key Features

**Auto-Population:**
- `labNameCache` is automatically populated from the referenced Laboratory
- Timestamps (`resolvedAt`, `closedAt`) are set based on status changes

**Validation:**
- Workstation numbers are validated against the laboratory's `numberOfWorkstations`
- Custodian IDs are validated to ensure they have lab_custodian or admin roles
- Image uploads are limited to 5 per report

**Virtual Fields:**
- `ageInDays`: Calculates report age in days
- `resolutionTimeHours`: Calculates time to resolution in hours
- `workstationDisplay`: Returns formatted workstation display

**Instance Methods:**
- `addCustodianNote(note, custodianId)`: Adds a custodian note with tracking
- `updateStatus(status, custodianId, note)`: Updates status with custodian tracking
- `canBeUpdatedBy(user)`: Checks if a user can update the report

**Static Methods:**
- `findByLaboratory(labId, options)`: Finds reports for a specific laboratory
- `findByStatus(status)`: Finds reports by status with populated references
- `getStatistics(filters)`: Returns aggregated statistics

#### Indexes
- `labId`
- `labNameCache`
- `issueCategory`
- `status`
- `reporterId`
- `updatedByCustodianId`
- `createdAt` (descending)
- Compound indexes: `labId + status`, `status + createdAt`, `issueCategory + status`

## Workflow System

### Report Status Flow

1. **Submitted** (Default)
   - Initial state when report is created
   - Reporter can still modify the report

2. **Verified by Lab Custodian**
   - Lab custodian has acknowledged the issue
   - Report enters the official workflow

3. **In Progress**
   - Issue is being actively worked on
   - Custodian can add progress notes

4. **Resolved**
   - Issue has been fixed
   - `resolvedAt` timestamp is automatically set

5. **Closed**
   - Report is finalized and archived
   - `closedAt` timestamp is automatically set

### Custodian Tracking

- Every status change tracks which custodian made the update
- Custodian notes preserve a complete audit trail
- Each note includes custodian ID and timestamp
- The system tracks the last custodian who acted on each report

## Auto-Sync System

### Laboratory → Report Synchronization

When a Laboratory's `labName` is updated:

1. **Trigger**: `findOneAndUpdate` or `save` operations on Laboratory
2. **Action**: Update all Report documents where `labId` matches
3. **Update**: Set `labNameCache` to the new `labName`
4. **Result**: Historical consistency maintained across all reports

```javascript
// Example: When lab name changes from "CS Lab 1" to "Computer Science Lab 1"
// All related reports automatically update their labNameCache field
```

## Usage Examples

### Creating a Laboratory

```javascript
const laboratory = new Laboratory({
  labCode: 'CSLAB01',
  labName: 'Computer Science Laboratory 1',
  location: 'Building A, Floor 2',
  description: 'Main computer laboratory for CS courses',
  numberOfWorkstations: 30
});

await laboratory.save();
```

### Creating a Report

```javascript
const report = new Report({
  labId: laboratory._id,
  workstationNumber: '15',
  issueCategory: 'hardware',
  description: 'Monitor flickering and occasionally goes black',
  reporterId: user._id
});

await report.save();
// labNameCache is automatically populated
```

### Custodian Workflow

```javascript
// Custodian adds a note
await report.addCustodianNote('Issue confirmed, ordering replacement monitor', custodian._id);

// Update status with note
await report.updateStatus('In Progress', custodian._id, 'Replacement monitor on order');

// Later, resolve the issue
await report.updateStatus('Resolved', custodian._id, 'New monitor installed and tested');
```

### Laboratory Name Update (Auto-Sync)

```javascript
// Update laboratory name
await Laboratory.findOneAndUpdate(
  { _id: laboratoryId },
  { $set: { labName: 'Updated Laboratory Name' } },
  { new: true }
);

// All related reports automatically have their labNameCache updated
```

## Security Considerations

1. **Role-Based Access**: Custodian validation ensures only authorized users can update reports
2. **Audit Trail**: Complete history of all custodian actions and notes
3. **Data Integrity**: Auto-sync maintains consistency without manual intervention
4. **Validation**: Workstation numbers validated against laboratory constraints

## Performance Considerations

1. **Indexes**: Comprehensive indexing for common query patterns
2. **Caching**: `labNameCache` reduces need for population in queries
3. **Aggregation**: Built-in statistics methods for reporting
4. **Pagination**: Models support efficient pagination with proper sorting

## Testing

Use the included test script to verify model functionality:

```bash
node test-models.js
```

The test script covers:
- Model creation and validation
- Virtual fields and instance methods
- Auto-sync functionality
- Static methods and queries
- Cleanup procedures
