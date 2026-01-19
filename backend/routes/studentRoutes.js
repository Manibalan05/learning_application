const express = require('express');
const router = express.Router();
const { getAllProblems, submitProblem, getStudentSubmissions, submitCode } = require('../controllers/studentController');

// Route: GET /student/problems
router.get('/problems', getAllProblems);

// Route: POST /student/submit (Executes code + saves)
router.post('/submit', submitProblem);

// Route: POST /student/submit-code (Verification & Save ONLY)
router.post('/submit-code', submitCode);

// Route: GET /student/submissions
router.get('/submissions', getStudentSubmissions);

module.exports = router;
