# 📊 ANALYTICS MODULE DOCUMENTATION
**Computer Laboratory Reporting System (CIT CLRS)**

## Overview
The Analytics Module provides comprehensive insights and statistics about the laboratory reporting system. It includes dashboard metrics, performance analytics, trend analysis, and leaderboards for custodians and users.

---

## 🔐 Authentication & Authorization
- **Authentication**: Bearer token required for all endpoints
- **Authorization**: Only `lab_custodian` and `admin` roles can access analytics
- **Base URL**: `/api/analytics`

---

## 📈 Available Endpoints

### 1. Summary Metrics
**Endpoint:** `GET /api/analytics/summary`
**Description:** Get key performance indicators and overall statistics

**Response:**
```json
{
  "success": true,
  "message": "Summary analytics retrieved successfully",
  "data": {
    "totalReports": 156,
    "openReports": 23,
    "resolvedReports": 108,
    "closedReports": 25,
    "reportsToday": 5,
    "reportsThisWeek": 18,
    "reportsThisMonth": 42
  }
}
```

**Definitions:**
- `openReports`: Reports with status NOT IN ["Resolved", "Closed"]
- `today`: Reports created today (since 00:00)
- `week`: Reports created since Monday 00:00
- `month`: Reports created since 1st of current month

---

### 2. Reports by Status
**Endpoint:** `GET /api/analytics/status-count`
**Description:** Get count of reports grouped by status

**Response:**
```json
{
  "success": true,
  "message": "Status count analytics retrieved successfully",
  "data": {
    "Submitted": 12,
    "Verified": 8,
    "InProgress": 15,
    "Resolved": 108,
    "Closed": 25
  }
}
```

---

### 3. Reports by Laboratory
**Endpoint:** `GET /api/analytics/by-lab`
**Description:** Get report statistics grouped by laboratory

**Response:**
```json
{
  "success": true,
  "message": "Reports by laboratory analytics retrieved successfully",
  "data": [
    {
      "labId": "60f1b2c3d4e5f6789a0b1c2d",
      "labName": "Computer Programming Laboratory",
      "totalReports": 45,
      "openReports": 8,
      "resolvedReports": 32,
      "closedReports": 5
    },
    {
      "labId": "60f1b2c3d4e5f6789a0b1c2e",
      "labName": "Networking Laboratory",
      "totalReports": 38,
      "openReports": 6,
      "resolvedReports": 28,
      "closedReports": 4
    }
  ]
}
```

---

### 4. Most Common Issue Categories
**Endpoint:** `GET /api/analytics/common-issues`
**Description:** Get frequency count of issue categories

**Response:**
```json
{
  "success": true,
  "message": "Common issues analytics retrieved successfully",
  "data": [
    { "category": "hardware", "count": 68 },
    { "category": "software", "count": 45 },
    { "category": "facility", "count": 23 },
    { "category": "cleanliness", "count": 12 }
  ]
}
```

---

### 5. Monthly Report Trend
**Endpoint:** `GET /api/analytics/monthly`
**Description:** Get report count trend for last 12 months

**Response:**
```json
{
  "success": true,
  "message": "Monthly report trend analytics retrieved successfully",
  "data": [
    { "month": "Mar", "year": 2025, "count": 23 },
    { "month": "Apr", "year": 2025, "count": 31 },
    { "month": "May", "year": 2025, "count": 28 },
    ...
    { "month": "Feb", "year": 2026, "count": 42 }
  ]
}
```

---

### 6. Daily Trend (Last 30 Days)
**Endpoint:** `GET /api/analytics/daily`
**Description:** Get daily report count for last 30 days

**Response:**
```json
{
  "success": true,
  "message": "Daily trend analytics retrieved successfully",
  "data": [
    { "date": "2026-01-24", "count": 3 },
    { "date": "2026-01-25", "count": 5 },
    { "date": "2026-01-26", "count": 2 },
    ...
    { "date": "2026-02-23", "count": 4 }
  ]
}
```

---

### 7. Laboratory Problem Heatmap
**Endpoint:** `GET /api/analytics/lab-heatmap`
**Description:** Get workstation-level problem counts (top 50 most problematic)

**Response:**
```json
{
  "success": true,
  "message": "Laboratory heatmap analytics retrieved successfully",
  "data": [
    {
      "labId": "60f1b2c3d4e5f6789a0b1c2d",
      "labName": "Computer Programming Laboratory",
      "workstationNumber": 15,
      "issueCount": 8
    },
    {
      "labId": "60f1b2c3d4e5f6789a0b1c2d", 
      "labName": "Computer Programming Laboratory",
      "workstationNumber": 23,
      "issueCount": 6
    }
  ]
}
```

---

### 8. Custodian Performance Metrics
**Endpoint:** `GET /api/analytics/custodian-performance`
**Description:** Get performance metrics for all lab custodians

**Response:**
```json
{
  "success": true,
  "message": "Custodian performance analytics retrieved successfully",
  "data": [
    {
      "custodianId": "60f1b2c3d4e5f6789a0b1c3f",
      "custodianName": "Alice Johnson",
      "reportsHandled": 45,
      "notesAdded": 23,
      "reportsResolved": 38,
      "reportsClosed": 12,
      "averageResolutionTime": 24.5
    },
    {
      "custodianId": "60f1b2c3d4e5f6789a0b1c4f",
      "custodianName": "Bob Smith", 
      "reportsHandled": 32,
      "notesAdded": 18,
      "reportsResolved": 28,
      "reportsClosed": 8,
      "averageResolutionTime": 18.2
    }
  ]
}
```

**Metrics Explanation:**
- `reportsHandled`: Total reports updated by custodian
- `notesAdded`: Total custodian notes added
- `reportsResolved`: Reports resolved by custodian
- `reportsClosed`: Reports closed by custodian
- `averageResolutionTime`: Average hours from creation to resolution

---

### 9. Top Reporting Students
**Endpoint:** `GET /api/analytics/top-students`
**Description:** Get top 10 students by report count

**Response:**
```json
{
  "success": true,
  "message": "Top reporting students analytics retrieved successfully",
  "data": [
    {
      "userId": "60f1b2c3d4e5f6789a0b1c5f",
      "fullName": "John Doe",
      "email": "john.doe@student.edu",
      "contactNumber": "09123456789",
      "totalReports": 12
    },
    {
      "userId": "60f1b2c3d4e5f6789a0b1c6f",
      "fullName": "Jane Smith",
      "email": "jane.smith@student.edu", 
      "contactNumber": "09876543210",
      "totalReports": 10
    }
  ]
}
```

---

### 10. Top Reporting Faculty
**Endpoint:** `GET /api/analytics/top-faculty`
**Description:** Get top 10 faculty members by report count

**Response:**
```json
{
  "success": true,
  "message": "Top reporting faculty analytics retrieved successfully",
  "data": [
    {
      "userId": "60f1b2c3d4e5f6789a0b1c7f",
      "fullName": "Dr. Maria Garcia",
      "email": "maria.garcia@faculty.edu",
      "contactNumber": "09111222333",
      "totalReports": 8
    }
  ]
}
```

---

### 11. Top Reporters (Combined)
**Endpoint:** `GET /api/analytics/top-reporters`
**Description:** Get top 20 reporters (students and faculty combined)

**Response:**
```json
{
  "success": true,
  "message": "Top reporters analytics retrieved successfully",
  "data": [
    {
      "userId": "60f1b2c3d4e5f6789a0b1c5f",
      "fullName": "John Doe",
      "role": "student",
      "totalReports": 12
    },
    {
      "userId": "60f1b2c3d4e5f6789a0b1c6f",
      "fullName": "Jane Smith",
      "role": "student", 
      "totalReports": 10
    },
    {
      "userId": "60f1b2c3d4e5f6789a0b1c7f",
      "fullName": "Dr. Maria Garcia",
      "role": "faculty",
      "totalReports": 8
    }
  ]
}
```

---

### 12. Top Custodian of the Week
**Endpoint:** `GET /api/analytics/top-custodian-week`
**Description:** Get weekly leaderboard of custodian performance (top 5)

**Response:**
```json
{
  "success": true,
  "message": "Top custodian of the week analytics retrieved successfully",
  "data": {
    "weekRange": {
      "startOfWeek": "2026-02-17T00:00:00.000Z",
      "endOfWeek": "2026-02-23T23:59:59.999Z"
    },
    "topCustodians": [
      {
        "custodianId": "60f1b2c3d4e5f6789a0b1c3f",
        "custodianName": "Alice Johnson",
        "reportsHandled": 12,
        "statusUpdates": 12,
        "notesAdded": 8,
        "reportsResolved": 10,
        "reportsClosed": 3
      },
      {
        "custodianId": "60f1b2c3d4e5f6789a0b1c4f", 
        "custodianName": "Bob Smith",
        "reportsHandled": 8,
        "statusUpdates": 8,
        "notesAdded": 5,
        "reportsResolved": 6,
        "reportsClosed": 2
      }
    ]
  }
}
```

**Weekly Metrics:**
- **Week Range**: Monday 00:00 to Sunday 23:59
- **Ranking Priority**: 
  1. Reports Handled (DESC)
  2. Notes Added (DESC)  
  3. Reports Resolved (DESC)
  4. Reports Closed (DESC)

---

## 🔧 Technical Implementation

### Database Aggregations
The module uses MongoDB aggregation pipelines for efficient data processing:

```javascript
// Example: Monthly trend aggregation
const monthlyData = await Report.aggregate([
  {
    $match: {
      createdAt: { $gte: twelveMonthsAgo }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      },
      count: { $sum: 1 }
    }
  },
  {
    $sort: {
      '_id.year': 1,
      '_id.month': 1
    }
  }
]);
```

### Performance Optimizations
- **Parallel Queries**: Multiple metrics calculated simultaneously using `Promise.all()`
- **Indexed Fields**: Leverages database indexes on `createdAt`, `status`, `labId`, `reporterId`
- **Efficient Aggregations**: Uses MongoDB's native aggregation framework
- **Limited Results**: Large datasets limited to prevent performance issues

---

## 🎯 Use Cases

### Dashboard Integration
Perfect for creating comprehensive analytics dashboards with:
- KPI cards showing summary metrics
- Chart components for trends and distributions
- Leaderboards for gamification
- Heatmaps for identifying problem areas

### Performance Monitoring
Track system efficiency through:
- Resolution time analysis
- Custodian workload distribution
- Laboratory utilization patterns
- User engagement metrics

### Decision Support
Data-driven insights for:
- Resource allocation planning
- Maintenance scheduling optimization
- Performance recognition programs
- System improvement priorities

---

## 🧪 Testing with Postman

### Setup Authentication
1. Login to get JWT token: `POST /api/auth/login`
2. Add to all requests: `Authorization: Bearer {token}`
3. Ensure user role is `lab_custodian` or `admin`

### Test All Endpoints
```
GET /api/analytics/test                    # Test route access
GET /api/analytics/summary                 # Dashboard overview
GET /api/analytics/status-count            # Status distribution
GET /api/analytics/by-lab                  # Laboratory breakdown
GET /api/analytics/common-issues           # Issue categories
GET /api/analytics/monthly                 # 12-month trend
GET /api/analytics/daily                   # 30-day trend
GET /api/analytics/lab-heatmap             # Problem hotspots
GET /api/analytics/custodian-performance   # Performance metrics
GET /api/analytics/top-students            # Student leaderboard
GET /api/analytics/top-faculty             # Faculty leaderboard  
GET /api/analytics/top-reporters           # Combined leaderboard
GET /api/analytics/top-custodian-week      # Weekly performance
```

---

## 📊 Error Handling

### Common Error Responses

**Unauthorized Access (401):**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Insufficient Permissions (403):**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Server error while fetching analytics",
  "error": "Detailed error message (development only)"
}
```

---

## 🚀 Future Enhancements

### Planned Features
1. **Real-time Analytics**: WebSocket integration for live dashboard updates
2. **Custom Date Ranges**: User-defined time periods for all analytics
3. **Export Capabilities**: PDF/Excel export functionality
4. **Advanced Filtering**: Multi-criteria filtering across all endpoints
5. **Predictive Analytics**: Machine learning insights for maintenance scheduling
6. **Comparative Analysis**: Period-over-period comparison metrics

### Scalability Considerations
- **Caching Layer**: Redis implementation for frequently accessed data
- **Data Archiving**: Historical data management for long-term analytics
- **Query Optimization**: Materialized views for complex aggregations
- **Load Balancing**: Horizontal scaling for high-traffic scenarios

---

**🎉 Analytics Module fully implemented and ready for dashboard integration!**
