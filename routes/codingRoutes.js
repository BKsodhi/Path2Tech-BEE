// routes/codingRoutes.js
const express = require('express');
const router = express.Router();
const codingController = require('../controllers/codingController');
const { ensureAuthenticated } = require('../middlewares/auth');

/**
 * ✅ All routes are prefixed with '/coding' in app.js
 * Example: app.use('/coding', codingRoutes);
 */

// 1️⃣ GET /coding - Display list of all coding problems (Home page)
router.get('/', ensureAuthenticated, codingController.getCodingHome);

// 2️⃣ GET /coding/:id - Display a specific coding problem and editor
router.get('/:id', ensureAuthenticated, codingController.getCodingProblem);

// 3️⃣ POST /coding/run/:id - Run code against the sample test case (AJAX)
router.post('/run/:id', ensureAuthenticated, express.json(), codingController.runCode);

// 4️⃣ POST /coding/submit/:id - Submit code against all test cases
router.post('/submit/:id', ensureAuthenticated, express.urlencoded({ extended: true }), codingController.submitCode);

module.exports = router;
