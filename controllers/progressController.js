// routes/progress.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // your PostgreSQL connection

router.get('/progress', async (req, res) => {
  const userId = req.session.user.id; // assuming session stores logged-in user

  try {
    // 1. Summary per subject
    const summaryQuery = `
      SELECT subject, type, difficulty, COUNT(*) AS attempts, 
             AVG(score * 100.0 / total) AS percentage
      FROM attempts
      WHERE user_id = $1
      GROUP BY subject, type, difficulty
    `;
    const summaryResult = await pool.query(summaryQuery, [userId]);
    const summary = summaryResult.rows;

    // 2. Attempt history
    const attemptsQuery = `
      SELECT subject, difficulty, score, total, created_at,
             (score * 100.0 / total) AS percentage
      FROM attempts
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const attemptsResult = await pool.query(attemptsQuery, [userId]);
    const attempts = attemptsResult.rows;

    // 3. Skill mastery data (user vs platform average)
    const skillQuery = `
      SELECT subject,
             AVG(score * 100.0 / total) FILTER (WHERE user_id = $1) AS user_score,
             AVG(score * 100.0 / total) AS avg_score
      FROM attempts
      WHERE subject IN ('Java', 'Cloud Computing', 'System Design')
      GROUP BY subject
    `;
    const skillResult = await pool.query(skillQuery, [userId]);
    const skillData = skillResult.rows.map(row => ({
      subject: row.subject,
      user_score: row.user_score || 0,
      avg_score: row.avg_score || 0
    }));

    // 4. Global leaderboard (top 5 users by avg percentage)
    const leaderboardQuery = `
      SELECT u.username,
             AVG(a.score * 100.0 / a.total) AS percentage
      FROM users u
      JOIN attempts a ON u.id = a.user_id
      GROUP BY u.id
      ORDER BY percentage DESC
      LIMIT 5
    `;
    const leaderboardResult = await pool.query(leaderboardQuery);
    const leaderboard = leaderboardResult.rows;

    res.render('progress', { summary, attempts, skillData, leaderboard });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
