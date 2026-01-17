const express = require('express');
const router = express.Router();
const { getWeeklyAnalytics, getMonthlyAnalytics } = require('../controllers/analyticsController');

// Route: GET /admin/analytics/weekly
router.get('/weekly', getWeeklyAnalytics);

// Route: GET /admin/analytics/monthly
router.get('/monthly', getMonthlyAnalytics);

module.exports = router;
