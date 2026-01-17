# AI-Free Student Coding & Evaluation Platform
## Presentation Slides Content

---

### Slide 1: Title Slide
**Title:** AI-Free Student Coding & Evaluation Platform
**Subtitle:** Ensuring Academic Integrity in the Era of Generative AI
**presented by:** [Your Name/Team Name]

---

### Slide 2: The Problem
**Title:** The Challenge
*   **Rise of AI:** Tools like ChatGPT and Gemini make it easy for students to generate code solutions instantly.
*   **Academic Dishonesty:** Traditional coding assignments are becoming obsolete as students copy-paste AI responses.
*   **Skill Gap:** Students pass without essentially learning logic building or syntax, leading to a gap in actual coding proficiency.
*   **Lack of Monitoring:** Current simple compilers don't track *how* the code was written (e.g., paste events, time taken).

---

### Slide 3: The Solution
**Title:** Our Solution: AI-Free Coding Ecosystem
*   **Controlled Environment:** A dedicated web platform for coding tests.
*   **Behavioral Analysis:** Tracks user behavior (typing patterns, paste frequency, focus loss) rather than just text analysis.
*   **Integrity Score:** Assigns an "AI Probability Score" to every submission based on heuristics.
*   **Real-time Execution:** Integrated Judge0 compiler for instant feedback on code correctness.

---

### Slide 4: Key Features (Student)
**Title:** For Students
*   **Professional Editor:** Monaco Editor (VS Code experience) for a comfortable coding environment.
*   **Multi-Language Support:** Supports C, C++, Java, and Python.
*   **Instant Feedback:** Real-time output, error messages, and execution time.
*   **Submission History:** Track progress and review past solutions.

---

### Slide 5: Key Features (Admin/Faculty)
**Title:** For Faculty & Admins
*   **Problem Management:** Easy-to-use interface to create coding challenges with custom test cases.
*   **Dashboard & Analytics:** View class performance, pass/fail rates, and weekly/monthly trends.
*   **Suspicious Activity Flagging:** Automatically highlights submissions with high AI Probability (>60%) or massive copy-paste events.
*   **Detailed Review:** View the exact code submitted, execution logs, and behavioral metadata.

---

### Slide 6: Technology Stack
**Title:** Under the Hood
*   **Frontend:** React.js + Vite (Fast, responsive UI).
*   **Backend:** Node.js + Express (API Management).
*   **Database & Auth:** Appwrite (Secure user management and scalable database).
*   **Code Execution:** Judge0 API (Sandboxed, secure remote code execution).
*   **Editor:** Monaco Editor (Industry standard code editor).

---

### Slide 7: How It Works (Workflow)
**Title:** System Workflow
1.  **Admin** posts a problem logic & test cases.
2.  **Student** logs in and opens the problem.
3.  **System** monitors key presses, time, and paste events while they code.
4.  **Student** submits code -> Backend runs it against Judge0.
5.  **System** calculates "AI Score" based on heuristics (e.g., 100 lines of code in 2 seconds = 100% Suspicion).
6.  **Admin** reviews the solution and the integrity score.

---

### Slide 8: Live Demo
**Title:** Application Walkthrough
*(Use this slide to switch to the live app and show:)*
1.  **Login** (Admin vs Student).
2.  **Adding a Problem** (Admin view).
3.  **Solving a Problem** (Student view - maybe show a copy-paste warning).
4.  **Analytics Dashboard** (Admin view).

---

### Slide 9: Future Enhancements
**Title:** Future Roadmap
*   **Proctoring Integration:** Webcam monitoring and tab-switching detection.
*   **Advanced AI Models:** Using ML models to analyze code style fingerprinting (Stylometry).
*   **Plagiarism Check:** Comparing student code against peers (MOSS-like feature).
*   **Gamification:** Leaderboards and badges for genuine coding streaks.

---

### Slide 10: Conclusion
**Title:** Summary
*   We bridge the gap between AI convenience and genuine learning.
*   Provides a fair ground for evaluating student skills.
*   Modern, scalable, and easy to deploy for universities and colleges.

---

### Slide 11: Q&A
**Title:** Thank You!
*   Questions?
