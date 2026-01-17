const express = require('express');
const router = express.Router();
const { addProblem, getAllSubmissions } = require('../controllers/adminController');

// Route: POST /admin/add-problem
router.post('/add-problem', addProblem);

// Route: GET /admin/submissions
router.get('/submissions', getAllSubmissions);

module.exports = router;
