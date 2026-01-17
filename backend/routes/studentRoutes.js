const express = require('express');
const router = express.Router();
const { getAllProblems, submitProblem, getStudentSubmissions } = require('../controllers/studentController');

// Route: GET /student/problems
router.get('/problems', getAllProblems);

// Route: POST /student/submit
router.post('/submit', submitProblem);

// Route: GET /student/submissions
router.get('/submissions', getStudentSubmissions);

module.exports = router;
