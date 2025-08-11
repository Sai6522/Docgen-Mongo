const express = require('express');
const Audit = require('../models/Audit');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: Get audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       403:
 *         description: Unauthorized
 */
router.get('/', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      userId,
      startDate,
      endDate,
      batchId,
      success
    } = req.query;

    const query = {};

    // HR users can only see their own audit logs
    if (req.user.role === 'hr') {
      query.userId = req.user._id;
    }

    // Apply filters
    if (action) query.action = action;
    if (userId && req.user.role === 'admin') query.userId = userId;
    if (batchId) query.batchId = batchId;
    if (success !== undefined) query.success = success === 'true';

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const auditLogs = await Audit.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Audit.countDocuments(query);

    res.json({
      auditLogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Audit logs fetch error:', error);
    res.status(500).json({ message: 'Server error fetching audit logs' });
  }
});

/**
 * @swagger
 * /api/audit/stats:
 *   get:
 *     summary: Get audit statistics
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Audit statistics retrieved successfully
 *       403:
 *         description: Unauthorized
 */
router.get('/stats', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const query = { createdAt: { $gte: startDate } };

    // HR users can only see their own stats
    if (req.user.role === 'hr') {
      query.userId = req.user._id;
    }

    // Get action statistics
    const actionStats = await Audit.aggregate([
      { $match: query },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get user statistics (admin only)
    let userStats = [];
    if (req.user.role === 'admin') {
      userStats = await Audit.aggregate([
        { $match: query },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { _id: 1, count: 1, 'user.name': 1, 'user.email': 1, 'user.role': 1 } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
    }

    // Get success/failure statistics
    const successStats = await Audit.aggregate([
      { $match: query },
      { $group: { _id: '$success', count: { $sum: 1 } } }
    ]);

    // Get daily activity for the period
    const dailyActivity = await Audit.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get total counts
    const totalLogs = await Audit.countDocuments(query);
    const totalDocuments = await Audit.countDocuments({
      ...query,
      action: { $in: ['document_generated', 'bulk_generation'] }
    });

    res.json({
      period,
      startDate,
      endDate: now,
      totalLogs,
      totalDocuments,
      actionStats,
      userStats,
      successStats,
      dailyActivity
    });

  } catch (error) {
    console.error('Audit stats error:', error);
    res.status(500).json({ message: 'Server error fetching audit statistics' });
  }
});

/**
 * @swagger
 * /api/audit/{id}:
 *   get:
 *     summary: Get audit log by ID
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit log retrieved successfully
 *       404:
 *         description: Audit log not found
 *       403:
 *         description: Unauthorized
 */
router.get('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // HR users can only see their own audit logs
    if (req.user.role === 'hr') {
      query.userId = req.user._id;
    }

    const auditLog = await Audit.findOne(query)
      .populate('userId', 'name email role')
      .populate('targetId');

    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    res.json({ auditLog });

  } catch (error) {
    console.error('Audit log fetch error:', error);
    res.status(500).json({ message: 'Server error fetching audit log' });
  }
});

/**
 * @swagger
 * /api/audit/export:
 *   get:
 *     summary: Export audit logs to CSV
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Export from date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Export to date
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *     responses:
 *       200:
 *         description: CSV file generated successfully
 *       403:
 *         description: Unauthorized
 */
router.get('/export', auth, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate, action } = req.query;

    const query = {};

    // Apply filters
    if (action) query.action = action;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const auditLogs = await Audit.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10000); // Limit to prevent memory issues

    // Convert to CSV format
    const csvHeaders = [
      'Date',
      'Action',
      'User Name',
      'User Email',
      'User Role',
      'Success',
      'IP Address',
      'Details',
      'Error Message'
    ];

    const csvRows = auditLogs.map(log => [
      log.createdAt.toISOString(),
      log.action,
      log.userId?.name || 'Unknown',
      log.userId?.email || 'Unknown',
      log.userRole,
      log.success ? 'Yes' : 'No',
      log.ipAddress || '',
      log.details ? JSON.stringify(Object.fromEntries(log.details)) : '',
      log.errorMessage || ''
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Audit export error:', error);
    res.status(500).json({ message: 'Server error exporting audit logs' });
  }
});

module.exports = router;
