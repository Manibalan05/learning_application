const express = require('express');
const router = express.Router();
const { addProblem, getAllSubmissions } = require('../controllers/adminController');

// Route: POST /admin/add-problem
router.post('/add-problem', addProblem);

// Route: GET /admin/submissions (alias)
router.get('/submissions', getAllSubmissions);

// Route: GET /admin/view-submissions (Strict requirement)
router.get('/view-submissions', getAllSubmissions);

module.exports = router;
