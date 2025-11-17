const express = require("express");
const pool = require("../db");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const { calculatePercentage } = require("../utils/progressUtil");

// Show progress dashboard
router.get("/", ensureAuth, async (req, res) => {
  try {
    const userId = req.user.id; // FIXED (was req.session.user.id)

    // Fetch attempts for current user
    const attemptsRes = await pool.query(
      `SELECT id, subject, type, difficulty, score, total, created_at
       FROM progress
       WHERE user_id=$1
       ORDER BY created_at DESC`,
      [userId]
    );

    const attempts = attemptsRes.rows.map(a => ({
      ...a,
      percentage: calculatePercentage(a.score, a.total)
    }));

    // Aggregate summary
    const summaryMap = {};
    attempts.forEach(r => {
      const key = `${r.subject}-${r.type}-${r.difficulty}`;
      if (!summaryMap[key]) {
        summaryMap[key] = {
          subject: r.subject,
          type: r.type,
          difficulty: r.difficulty,
          attempts: 0,
          totalPercentage: 0
        };
      }
      summaryMap[key].attempts++;
      summaryMap[key].totalPercentage += Number(r.percentage);
    });

    const summary = Object.values(summaryMap).map(s => ({
      ...s,
      percentage: Number((s.totalPercentage / s.attempts).toFixed(2))
    }));

    // Skill data for radar chart (example)
    const skillData = [
      { subject: "Java", user_score: 70, avg_score: 65 },
      { subject: "Cloud Computing", user_score: 60, avg_score: 55 },
      { subject: "System Design", user_score: 50, avg_score: 50 },
    ];

    // Leaderboard: top 5 users by average percentage
    const leaderboardRes = await pool.query(
      `SELECT u.username, AVG(p.score*100.0/p.total) AS percentage
       FROM users u
       JOIN progress p ON u.id = p.user_id
       GROUP BY u.id
       ORDER BY percentage DESC
       LIMIT 5`
    );
    const leaderboard = leaderboardRes.rows;

    res.render("progress", {
      title: "My Progress - Path2Tech",
      attempts,
      summary,
      skillData,
      leaderboard
    });
  } catch (err) {
    console.error("Error loading progress:", err.message);
    res.status(500).send("Error loading progress");
  }
});

// Insert new attempt
router.post("/update", ensureAuth, async (req, res) => {
  try {
    const { subject, type, difficulty, score, total } = req.body;
    const userId = req.user.id; // FIXED

    await pool.query(
      `INSERT INTO progress (user_id, subject, type, difficulty, score, total, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userId, subject, type, difficulty, score, total]
    );

    res.redirect("/progress");
  } catch (err) {
    console.error("Error updating progress:", err.message);
    res.status(500).send("Error updating progress");
  }
});

module.exports = router;
