/**
 * ===========================================
 * ANALYTICS CONTROLLER
 * ===========================================
 * Handles all analytics and reporting operations for dashboard insights,
 * performance metrics, and statistical analysis
 */

const mongoose = require('mongoose');
const { Report, Laboratory, User, News } = require('../models');
const Reaction = require('../models/Reaction');

// ===========================================
// 1. SUMMARY METRICS
// ===========================================

/**
 * @desc    Get summary analytics metrics
 * @route   GET /api/analytics/summary
 * @access  Private (Lab Custodian, Admin)
 */
const getSummary = async (req, res) => {
  try {
    console.log('📊 Getting analytics summary...');

    // Get current date boundaries
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as 0
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Execute all queries in parallel for better performance
    const [
      totalReports,
      openReports,
      resolvedReports,
      closedReports,
      reportsToday,
      reportsThisWeek,
      reportsThisMonth,
      avgResolutionAgg
    ] = await Promise.all([
      // Total reports
      Report.countDocuments(),
      
      // Open reports (not resolved or closed)
      Report.countDocuments({
        status: { $nin: ['resolved', 'closed'] }
      }),
      
      // Resolved reports
      Report.countDocuments({ status: 'resolved' }),
      
      // Closed reports
      Report.countDocuments({ status: 'closed' }),
      
      // Reports created today
      Report.countDocuments({
        createdAt: { $gte: startOfToday }
      }),
      
      // Reports created this week
      Report.countDocuments({
        createdAt: { $gte: startOfWeek }
      }),
      
      // Reports created this month
      Report.countDocuments({
        createdAt: { $gte: startOfMonth }
      }),

      // Average resolution time in days (resolved reports only)
      Report.aggregate([
        {
          $match: {
            status: { $in: ['resolved', 'Resolved'] }
          }
        },
        {
          $project: {
            resolvedAtEffective: { $ifNull: ['$resolvedAt', '$updatedAt'] },
            createdAt: 1
          }
        },
        {
          $match: {
            resolvedAtEffective: { $ne: null }
          }
        },
        {
          $project: {
            resolutionDays: {
              $divide: [
                { $subtract: ['$resolvedAtEffective', '$createdAt'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResolutionDays: { $avg: '$resolutionDays' }
          }
        }
      ])
    ]);

    const avgResolutionDays = Array.isArray(avgResolutionAgg) && avgResolutionAgg.length > 0
      ? Math.round(avgResolutionAgg[0].avgResolutionDays * 10) / 10
      : null;

    const summary = {
      totalReports,
      openReports,
      resolvedReports,
      closedReports,
      reportsToday,
      reportsThisWeek,
      reportsThisMonth,
      avgResolutionDays
    };

    console.log('✅ Summary metrics calculated successfully');

    res.status(200).json({
      success: true,
      message: 'Summary analytics retrieved successfully',
      data: summary
    });

  } catch (error) {
    console.error('❌ Get summary analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching summary analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// 2. REPORTS BY STATUS
// ===========================================

/**
 * @desc    Get report counts by status
 * @route   GET /api/analytics/status-count
 * @access  Private (Lab Custodian, Admin)
 */
const getStatusCount = async (req, res) => {
  try {
    console.log('📊 Getting status count analytics...');

    const statusCounts = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Initialize all status counts to 0
    const result = {
      'submitted': 0,
      'verified': 0,
      'in_progress': 0,
      'resolved': 0,
      'closed': 0
    };

    // Map results to our structure
    statusCounts.forEach(item => {
      if (result.hasOwnProperty(item._id)) {
        result[item._id] = item.count;
      }
    });

    // Create response with cleaner naming
    const response = {
      Submitted: result['submitted'],
      Verified: result['verified'],
      InProgress: result['in_progress'],
      Resolved: result['resolved'],
      Closed: result['closed']
    };

    console.log('✅ Status count analytics calculated successfully');

    res.status(200).json({
      success: true,
      message: 'Status count analytics retrieved successfully',
      data: response
    });

  } catch (error) {
    console.error('❌ Get status count analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching status analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// 3. REPORTS BY LABORATORY
// ===========================================

/**
 * @desc    Get report counts by laboratory
 * @route   GET /api/analytics/by-lab
 * @access  Private (Lab Custodian, Admin)
 */
const getReportsByLab = async (req, res) => {
  try {
    console.log('📊 Getting reports by laboratory analytics...');

    const labReports = await Report.aggregate([
      {
        $group: {
          _id: '$labId',
          labName: { $first: '$labNameCache' },
          totalReports: { $sum: 1 },
          statusList: { $push: '$status' }
        }
      },
      {
        $addFields: {
          openReports: {
            $size: {
              $filter: {
                input: '$statusList',
                cond: { $not: { $in: ['$$this', ['Resolved', 'Closed']] } }
              }
            }
          },
          resolvedReports: {
            $size: {
              $filter: {
                input: '$statusList',
                cond: { $eq: ['$$this', 'Resolved'] }
              }
            }
          },
          closedReports: {
            $size: {
              $filter: {
                input: '$statusList',
                cond: { $eq: ['$$this', 'Closed'] }
              }
            }
          }
        }
      },
      {
        $project: {
          labId: '$_id',
          labName: 1,
          totalReports: 1,
          openReports: 1,
          resolvedReports: 1,
          closedReports: 1,
          _id: 0
        }
      },
      {
        $sort: { totalReports: -1 }
      }
    ]);

    console.log('✅ Reports by laboratory analytics calculated successfully');

    res.status(200).json({
      success: true,
      message: 'Reports by laboratory analytics retrieved successfully',
      data: labReports
    });

  } catch (error) {
    console.error('❌ Get reports by lab analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching laboratory analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// 4. MOST COMMON ISSUE CATEGORIES
// ===========================================

/**
 * @desc    Get most common issue categories
 * @route   GET /api/analytics/common-issues
 * @access  Private (Lab Custodian, Admin)
 */
const getCommonIssues = async (req, res) => {
  try {
    console.log('📊 Getting common issues analytics...');

    const commonIssues = await Report.aggregate([
      {
        $group: {
          _id: '$issueCategory',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('✅ Common issues analytics calculated successfully');

    res.status(200).json({
      success: true,
      message: 'Common issues analytics retrieved successfully',
      data: commonIssues
    });

  } catch (error) {
    console.error('❌ Get common issues analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issue analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// 5. MONTHLY REPORT TREND (12 MONTHS)
// ===========================================

/**
 * @desc    Get monthly report trend (last 12 months)
 * @route   GET /api/analytics/monthly
 * @access  Private (Lab Custodian, Admin)
 */
const getMonthlyReports = async (req, res) => {
  try {
    console.log('📊 Getting monthly report trend analytics...');

    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

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

    // Generate all 12 months with 0 counts for missing data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const dataPoint = monthlyData.find(item => 
        item._id.year === year && item._id.month === month
      );

      result.push({
        month: monthNames[date.getMonth()],
        year: year,
        count: dataPoint ? dataPoint.count : 0
      });
    }

    console.log('✅ Monthly report trend analytics calculated successfully');

    res.status(200).json({
      success: true,
      message: 'Monthly report trend analytics retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Get monthly reports analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching monthly analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// 6. DAILY TREND (LAST 30 DAYS)
// ===========================================

/**
 * @desc    Get daily report trend (last 30 days)
 * @route   GET /api/analytics/daily
 * @access  Private (Lab Custodian, Admin)
 */
const getDailyTrend = async (req, res) => {
  try {
    console.log('📊 Getting daily trend analytics...');

    const now = new Date();
    const latestReport = await Report.findOne({}, { createdAt: 1 }).sort({ createdAt: -1 }).lean();

    if (!latestReport) {
      console.log('ℹ️ No reports found for daily trend analytics');
      return res.status(200).json({
        success: true,
        message: 'Daily trend analytics retrieved successfully',
        data: []
      });
    }

    const endDate = new Date(latestReport.createdAt || now);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    const dailyData = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Generate all 30 days with 0 counts for missing data
    const result = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dataPoint = dailyData.find(item => item._id === dateStr);
      
      result.push({
        date: dateStr,
        count: dataPoint ? dataPoint.count : 0
      });
    }

    console.log('✅ Daily trend analytics calculated successfully');

    res.status(200).json({
      success: true,
      message: 'Daily trend analytics retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Get daily trend analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching daily analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// 7. LABORATORY PROBLEM HEATMAP
// ===========================================

/**
 * @desc    Get laboratory workstation problem heatmap
 * @route   GET /api/analytics/lab-heatmap
 * @access  Private (Lab Custodian, Admin)
 */
const getLabHeatmap = async (req, res) => {
  try {
    console.log('📊 Getting laboratory heatmap analytics...');

    const heatmapData = await Report.aggregate([
      {
        $match: {
          labId: { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            labId: '$labId',
            labName: { $ifNull: ['$labNameCache', 'Unknown Lab'] }
          },
          totalReports: { $sum: 1 },
          openReports: {
            $sum: {
              $cond: [{ $in: ['$status', ['submitted', 'verified', 'in_progress']] }, 1, 0]
            }
          },
          resolvedReports: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          closedReports: {
            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          labId: '$_id.labId',
          labName: '$_id.labName',
          totalReports: 1,
          openReports: 1,
          resolvedReports: 1,
          closedReports: 1,
          _id: 0
        }
      },
      {
        $sort: { totalReports: -1 }
      }
    ]);

    console.log('✅ Laboratory heatmap analytics calculated successfully');

    res.status(200).json({
      success: true,
      message: 'Laboratory heatmap analytics retrieved successfully',
      data: heatmapData
    });

  } catch (error) {
    console.error('❌ Get lab heatmap analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching heatmap analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// 8. CUSTODIAN PERFORMANCE METRICS
// ===========================================

/**
 * @desc    Get custodian performance metrics
 * @route   GET /api/analytics/custodian-performance
 * @access  Private (Lab Custodian, Admin)
 */
const getCustodianPerformance = async (req, res) => {
  try {
    console.log('📊 Getting custodian performance analytics...');

    // Get all lab custodians (include admins as custodians if needed)
    let custodians = await User.find({ role: { $in: ['lab_custodian', 'admin'] } })
      .select('_id fullName email');

    // Fallback: if no custodians found, use users referenced in reports
    if (!custodians || custodians.length === 0) {
      const updatedCustodianIds = await Report.distinct('updatedByCustodianId', {
        updatedByCustodianId: { $ne: null }
      });

      const noteCustodianIds = await Report.distinct('custodianNotes.custodianId', {
        custodianNotes: { $exists: true, $ne: [] }
      });

      const combinedIds = [...new Set([
        ...updatedCustodianIds.map(id => id?.toString()).filter(Boolean),
        ...noteCustodianIds.map(id => id?.toString()).filter(Boolean)
      ])];

      if (combinedIds.length > 0) {
        custodians = await User.find({ _id: { $in: combinedIds } })
          .select('_id fullName email');
      }
    }

    const performanceData = await Promise.all(
      custodians.map(async (custodian) => {
        const [
          reportsHandled,
          reportsResolved,
          reportsClosed,
          resolutionTimes
        ] = await Promise.all([
          // Reports handled (updated by custodian)
          Report.countDocuments({ updatedByCustodianId: custodian._id }),
          
          // Reports resolved by custodian
          Report.countDocuments({
            status: 'resolved',
            updatedByCustodianId: custodian._id
          }),
          
          // Reports closed by custodian
          Report.countDocuments({
            status: 'closed',
            updatedByCustodianId: custodian._id
          }),
          
          // Resolution times for average calculation
          Report.find({
            status: 'resolved',
            updatedByCustodianId: custodian._id,
            resolvedAt: { $ne: null }
          }).select('createdAt resolvedAt')
        ]);

        // Count notes added by custodian
        const notesResult = await Report.aggregate([
          { $unwind: '$custodianNotes' },
          { $match: { 'custodianNotes.custodianId': custodian._id } },
          { $count: 'notesCount' }
        ]);
        const notesAdded = notesResult.length > 0 ? notesResult[0].notesCount : 0;

        // Calculate average resolution time in hours
        let averageResolutionTime = 0;
        if (resolutionTimes.length > 0) {
          const totalTime = resolutionTimes.reduce((sum, report) => {
            const timeDiff = new Date(report.resolvedAt) - new Date(report.createdAt);
            return sum + (timeDiff / (1000 * 60 * 60)); // Convert to hours
          }, 0);
          averageResolutionTime = Math.round((totalTime / resolutionTimes.length) * 100) / 100;
        }

        return {
          custodianId: custodian._id,
          custodianName: custodian.fullName,
          reportsHandled,
          notesAdded,
          reportsResolved,
          reportsClosed,
          averageResolutionTime
        };
      })
    );

    // Sort by performance metrics
    performanceData.sort((a, b) => {
      if (b.reportsHandled !== a.reportsHandled) return b.reportsHandled - a.reportsHandled;
      if (b.reportsResolved !== a.reportsResolved) return b.reportsResolved - a.reportsResolved;
      return b.notesAdded - a.notesAdded;
    });

    console.log('✅ Custodian performance analytics calculated successfully');

    res.status(200).json({
      success: true,
      message: 'Custodian performance analytics retrieved successfully',
      data: performanceData
    });

  } catch (error) {
    console.error('❌ Get custodian performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching custodian performance analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// 9. TOP REPORTING STUDENTS
// ===========================================

/**
 * @desc    Get top reporting students
 * @route   GET /api/analytics/top-students
 * @access  Private (Lab Custodian, Admin)
 */
const getTopStudents = async (req, res) => {
  try {
    console.log('📊 Getting top reporting students analytics...');

    let topStudents = await Report.aggregate([
      {
        $group: {
          _id: '$reporterId',
          totalReports: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.role': 'student'
        }
      },
      {
        $project: {
          userId: '$_id',
          fullName: '$user.fullName',
          email: '$user.email',
          contactNumber: '$user.contactNumber',
          totalReports: 1,
          _id: 0
        }
      },
      {
        $sort: { totalReports: -1 }
      },
      {
        $limit: 10
      }
    ]);

    if (!topStudents || topStudents.length === 0) {
      const students = await User.find({ role: 'student' })
        .select('_id fullName email contactNumber')
        .limit(10);

      topStudents = students.map((student) => ({
        userId: student._id,
        fullName: student.fullName,
        email: student.email,
        contactNumber: student.contactNumber,
        totalReports: 0
      }));
    }

    console.log('✅ Top reporting students analytics calculated successfully');

    res.status(200).json({
      success: true,
      message: 'Top reporting students analytics retrieved successfully',
      data: topStudents
    });

  } catch (error) {
    console.error('❌ Get top students analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// 10. TOP REPORTING FACULTY
// ===========================================

/**
 * @desc    Get top reporting faculty
 * @route   GET /api/analytics/top-faculty
 * @access  Private (Lab Custodian, Admin)
 */
const getTopFaculty = async (req, res) => {
  try {
    console.log('📊 Getting top reporting faculty analytics...');

    const topFaculty = await Report.aggregate([
      {
        $group: {
          _id: '$reporterId',
          totalReports: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.role': 'faculty'
        }
      },
      {
        $project: {
          userId: '$_id',
          fullName: '$user.fullName',
          email: '$user.email',
          contactNumber: '$user.contactNumber',
          totalReports: 1,
          _id: 0
        }
      },
      {
        $sort: { totalReports: -1 }
      },
      {
        $limit: 10
      }
    ]);

    console.log('✅ Top reporting faculty analytics calculated successfully');

    res.status(200).json({
      success: true,
      message: 'Top reporting faculty analytics retrieved successfully',
      data: topFaculty
    });

  } catch (error) {
    console.error('❌ Get top faculty analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching faculty analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// 11. TOP REPORTERS (STUDENTS + FACULTY)
// ===========================================

/**
 * @desc    Get top reporters (students and faculty combined)
 * @route   GET /api/analytics/top-reporters
 * @access  Private (Lab Custodian, Admin)
 */
const getTopReporters = async (req, res) => {
  try {
    console.log('📊 Getting top reporters analytics...');

    const topReporters = await Report.aggregate([
      {
        $group: {
          _id: '$reporterId',
          totalReports: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.role': { $in: ['student', 'faculty'] }
        }
      },
      {
        $project: {
          userId: '$_id',
          fullName: '$user.fullName',
          role: '$user.role',
          totalReports: 1,
          _id: 0
        }
      },
      {
        $sort: { totalReports: -1 }
      },
      {
        $limit: 20
      }
    ]);

    console.log('✅ Top reporters analytics calculated successfully');

    res.status(200).json({
      success: true,
      message: 'Top reporters analytics retrieved successfully',
      data: topReporters
    });

  } catch (error) {
    console.error('❌ Get top reporters analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reporter analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// 12. TOP CUSTODIAN OF THE WEEK
// ===========================================

/**
 * @desc    Get top custodian of the week
 * @route   GET /api/analytics/top-custodian-week
 * @access  Private (Lab Custodian, Admin)
 */
const getTopCustodianWeek = async (req, res) => {
  try {
    console.log('📊 Getting top custodian of the week analytics...');

    // Calculate this week's date range
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    console.log(`📅 Week range: ${startOfWeek.toISOString()} to ${endOfWeek.toISOString()}`);

    // Get all lab custodians
    const custodians = await User.find({ role: 'lab_custodian' }).select('_id fullName');

    const weeklyPerformance = await Promise.all(
      custodians.map(async (custodian) => {
        const [
          reportsHandled,
          reportsResolved,
          reportsClosed
        ] = await Promise.all([
          // Reports handled this week
          Report.countDocuments({
            updatedByCustodianId: custodian._id,
            updatedAt: { $gte: startOfWeek, $lte: endOfWeek }
          }),
          
          // Reports resolved this week
          Report.countDocuments({
            status: 'Resolved',
            updatedByCustodianId: custodian._id,
            resolvedAt: { $gte: startOfWeek, $lte: endOfWeek }
          }),
          
          // Reports closed this week
          Report.countDocuments({
            status: 'Closed',
            updatedByCustodianId: custodian._id,
            closedAt: { $gte: startOfWeek, $lte: endOfWeek }
          })
        ]);

        // Count notes added this week
        const notesResult = await Report.aggregate([
          { $unwind: '$custodianNotes' },
          {
            $match: {
              'custodianNotes.custodianId': custodian._id,
              'custodianNotes.createdAt': { $gte: startOfWeek, $lte: endOfWeek }
            }
          },
          { $count: 'notesCount' }
        ]);
        const notesAdded = notesResult.length > 0 ? notesResult[0].notesCount : 0;

        return {
          custodianId: custodian._id,
          custodianName: custodian.fullName,
          reportsHandled,
          statusUpdates: reportsHandled, // Same as handled for this metric
          notesAdded,
          reportsResolved,
          reportsClosed
        };
      })
    );

    // Sort by performance metrics (priority order)
    weeklyPerformance.sort((a, b) => {
      if (b.reportsHandled !== a.reportsHandled) return b.reportsHandled - a.reportsHandled;
      if (b.notesAdded !== a.notesAdded) return b.notesAdded - a.notesAdded;
      if (b.reportsResolved !== a.reportsResolved) return b.reportsResolved - a.reportsResolved;
      return b.reportsClosed - a.reportsClosed;
    });

    // Get top 5 custodians
    const topCustodians = weeklyPerformance.slice(0, 5);

    console.log('✅ Top custodian of the week analytics calculated successfully');

    res.status(200).json({
      success: true,
      message: 'Top custodian of the week analytics retrieved successfully',
      data: {
        weekRange: {
          startOfWeek: startOfWeek.toISOString(),
          endOfWeek: endOfWeek.toISOString()
        },
        topCustodians
      }
    });

  } catch (error) {
    console.error('❌ Get top custodian week analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching weekly custodian analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// 9. NEWS & REACTIONS ANALYTICS
// ===========================================

/**
 * @desc    Get news and reactions analytics summary
 * @route   GET /api/analytics/news-summary
 * @access  Private (Lab Custodian, Admin)
 */
const getNewsAnalyticsSummary = async (req, res) => {
  try {
    console.log('📊 Getting news analytics summary...');

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(startOfToday.getDate() - 6);

    const [
      totalNewsPosts,
      pinnedNewsPosts,
      recentNewsPosts,
      reactionsAgg,
      postsPerDay,
      topPosts
    ] = await Promise.all([
      // Total news posts
      News.countDocuments(),

      // Total pinned posts
      News.countDocuments({ pinned: true }),

      // Posts created in the last 7 days
      News.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),

      // Aggregate reactions from embedded reactions array
      News.aggregate([
        {
          $project: {
            reactionCount: { $size: { $ifNull: ['$reactions', []] } }
          }
        },
        {
          $group: {
            _id: null,
            totalReactions: { $sum: '$reactionCount' },
            avgReactionsPerPost: { $avg: '$reactionCount' }
          }
        }
      ]),

      // Posts per day for the last 7 days
      News.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            count: 1
          }
        },
        { $sort: { date: 1 } }
      ]),

      // Top 5 posts by reaction count
      News.aggregate([
        {
          $project: {
            title: 1,
            author: 1,
            pinned: 1,
            createdAt: 1,
            reactionCount: { $size: { $ifNull: ['$reactions', []] } }
          }
        },
        { $sort: { reactionCount: -1, createdAt: -1 } },
        { $limit: 5 }
      ])
    ]);

    const reactionsSummary = Array.isArray(reactionsAgg) && reactionsAgg.length > 0
      ? reactionsAgg[0]
      : { totalReactions: 0, avgReactionsPerPost: 0 };

    const summary = {
      totalNewsPosts,
      pinnedNewsPosts,
      recentNewsPosts,
      totalReactions: reactionsSummary.totalReactions || 0,
      avgReactionsPerPost: reactionsSummary.avgReactionsPerPost
        ? Math.round(reactionsSummary.avgReactionsPerPost * 10) / 10
        : 0,
      postsPerDay,
      topPosts
    };

    console.log('✅ News analytics summary calculated successfully');

    res.status(200).json({
      success: true,
      message: 'News analytics summary retrieved successfully',
      data: summary
    });
  } catch (error) {
    console.error('❌ Get news analytics summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching news analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getSummary,
  getStatusCount,
  getReportsByLab,
  getCommonIssues,
  getMonthlyReports,
  getDailyTrend,
  getLabHeatmap,
  getCustodianPerformance,
  getTopStudents,
  getTopFaculty,
  getTopReporters,
  getTopCustodianWeek,
  getNewsAnalyticsSummary
};
