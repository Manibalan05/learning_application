# Code Submission Flow - Complete Guide

## Overview
This document explains the **Code Submission and Admin Viewing** workflow implemented in the AI-Free Student Coding & Evaluation Platform.

---

## 🎯 System Flow

### Student Side: Submit Code
1. Student solves a coding problem
2. Clicks **"Submit Solution"** button
3. Code is saved to database
4. Student is redirected to "My Submissions" page

### Admin Side: View Submissions
1. Admin opens Admin Portal
2. Navigates to "View Submissions"
3. Sees all student submissions with details
4. Can review code, timestamp, and student info

---

## 🔧 API Endpoints

### 1. Student: Submit Code
**Endpoint:** `POST /student/submit-code`

**Headers:**
```json
{
  "user-id": "<student-appwrite-user-id>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "problemId": "6967dc1500276f2d4429abc",
  "language": "python",
  "code": "a, b = map(int, input().split())\nprint(a + b)"
}
```

**Success Response (201):**
```json
{
  "message": "Code submitted successfully",
  "submissionId": "679f8a1b0001e2d3f4g5h6i",
  "createdAt": "2026-01-19T16:36:23.000+00:00"
}
```

**Error Responses:**
- **401 Unauthorized:** Missing user-id header
- **403 Forbidden:** User is not a student
- **400 Bad Request:** Missing required fields (problemId, language, code)
- **500 Internal Server Error:** Database or server issue

---

### 2. Admin: View All Submissions
**Endpoint:** `GET /admin/view-submissions`

**Headers:**
```json
{
  "user-id": "<admin-appwrite-user-id>"
}
```

**Success Response (200):**
```json
{
  "submissions": [
    {
      "id": "679f8a1b0001e2d3f4g5h6i",
      "userId": "student123",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "problemId": "6967dc1500276f2d4429abc",
      "problemTitle": "Addition of Two Numbers",
      "language": "python",
      "status": "Submitted",
      "executionTime": 0.0,
      "aiScore": 0,
      "createdAt": "2026-01-19T16:36:23.000+00:00",
      "code": "a, b = map(int, input().split())\nprint(a + b)",
      "output": "N/A"
    }
  ]
}
```

**Error Responses:**
- **401 Unauthorized:** Missing user-id
- **403 Forbidden:** User is not an admin
- **500 Internal Server Error:** Database issue

---

## 📊 Database Schema

### Collection: `submissions`

| Attribute       | Type   | Required | Description                              |
|----------------|--------|----------|------------------------------------------|
| userId         | String | Yes      | Student's Appwrite user ID               |
| problemId      | String | Yes      | Problem ID from problems collection      |
| language       | String | Yes      | Programming language (python, java, c, cpp) |
| code           | String | Yes      | Submitted source code                    |
| status         | String | Yes      | Submission status (e.g., "Submitted")    |
| output         | String | Yes      | Execution output (N/A for direct submit) |
| executionTime  | Float  | Yes      | Execution time in seconds (0.0 if not run) |
| aiscore        | Integer| Yes      | AI detection score (0-100)               |
| $createdAt     | DateTime | Auto  | Appwrite system timestamp                |

---

## 🎨 Frontend Example

### Submit Button (React)
```javascript
const handleSubmit = async () => {
    setIsSubmitting(true);
    setStatus('Submitting your solution...');

    try {
        const user = await account.get();

        const payload = {
            problemId: problem.problemId,
            language,
            code
        };

        const response = await axios.post('http://localhost:5000/student/submit-code', payload, {
            headers: { 'user-id': user.$id }
        });

        setStatus('✅ Code submitted successfully!');
        setTimeout(() => {
            navigate('/student/submissions');
        }, 2000);

    } catch (error) {
        console.error('Submission error:', error);
        setStatus('Error: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
    } finally {
        setIsSubmitting(false);
    }
};
```

---

## 🔒 Security Features

### Student Endpoint
- ✅ Validates `user-id` header is present
- ✅ Verifies user has "student" label in Appwrite
- ✅ Validates all required fields (problemId, language, code)
- ✅ Returns 403 if non-student attempts to submit

### Admin Endpoint
- ✅ Validates `user-id` header is present
- ✅ Verifies user has "admin" label in Appwrite
- ✅ Returns 403 if non-admin attempts to view
- ✅ Enriches data with student names and problem titles

---

## ✅ Testing Guide

### Test Student Submission
1. Login as a student
2. Navigate to any problem
3. Write code in the editor
4. Click "Submit Solution"
5. Verify success message appears
6. Check "My Submissions" page

### Test Admin View
1. Login as admin
2. Navigate to "View Submissions" (or "All Submissions")
3. Verify you see:
   - Student name and email
   - Problem title
   - Submission time
   - Code preview
   - Language used

### Using Postman/curl
```bash
# Student Submit
curl -X POST http://localhost:5000/student/submit-code \
  -H "Content-Type: application/json" \
  -H "user-id: YOUR_STUDENT_USER_ID" \
  -d '{
    "problemId": "PROBLEM_ID",
    "language": "python",
    "code": "print(\"Hello World\")"
  }'

# Admin View
curl -X GET http://localhost:5000/admin/view-submissions \
  -H "user-id: YOUR_ADMIN_USER_ID"
```

---

## 🚨 Common Issues & Solutions

### Issue: 403 Forbidden
**Cause:** User doesn't have correct label (student/admin)
**Solution:** 
1. Go to Appwrite Console
2. Navigate to Auth → Users
3. Select the user
4. Add label "student" or "admin"

### Issue: 400 Bad Request - Missing fields
**Cause:** Frontend not sending required fields
**Solution:** Ensure payload includes `problemId`, `language`, and `code`

### Issue: 500 Internal Server Error - Unknown attribute
**Cause:** Appwrite collection missing required attributes
**Solution:** Add these attributes to `submissions` collection:
- userId (String, 255, Required)
- problemId (String, 255, Required)
- language (String, 50, Required)
- code (String, 10000, Required)
- status (String, 100, Required)
- output (String, 5000, Required)
- executionTime (Float, Min: 0, Max: 100, Required)
- aiscore (Integer, Min: 0, Max: 100, Required)

---

## 📝 Implementation Notes

### Why Two Endpoints?
- **`/student/submit`**: Runs code through Judge0, calculates AI score, then saves
- **`/student/submit-code`**: **Direct save only** - no execution, faster, simpler

### Immutability
- Submissions are **not editable** after creation
- Each submit creates a **new record** (history is preserved)
- Students can resubmit, creating new submissions

### Future Enhancements
- Add pagination to admin view (currently limited to 100)
- Add filtering by student, problem, or date range
- Download submissions as CSV/PDF
- Add code syntax highlighting in admin view

---

## 🎓 Beginner-Friendly Summary

**What happens when a student submits code?**
1. Frontend sends: Problem ID, Language, and Code
2. Backend checks: Is this person a student?
3. Database saves: All the information with timestamp
4. Student sees: Success message and redirect

**What happens when admin views submissions?**
1. Frontend requests: All submissions
2. Backend checks: Is this person an admin?
3. Backend enriches: Adds student names and problem titles
4. Admin sees: Complete table with all details

---

**Documentation created:** 2026-01-19
**System Version:** 1.0
**Status:** ✅ Complete and Tested
