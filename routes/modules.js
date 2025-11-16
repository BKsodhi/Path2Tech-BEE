const express = require("express");
const pool = require("../db");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const { calculatePercentage } = require("../utils/progressUtil");

// GET: Show MCQs + Theory for current difficulty
router.get("/:subject/:type/:difficulty", ensureAuth, async (req, res) => {
  const { subject, type, difficulty } = req.params;
  const userId = req.user.id;

  try {
    // Fetch MCQs
    const qRes = await pool.query(
      `SELECT * FROM modules WHERE subject=$1 AND type=$2 AND difficulty=$3 ORDER BY id`,
      [subject, type, difficulty]
    );

    const questions = {};
    questions[difficulty] = qRes.rows.map(q => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || "[]")
    }));

    // Fetch theory
    const tRes = await pool.query(
      `SELECT content FROM theory WHERE subject=$1 AND type=$2 AND difficulty=$3`,
      [subject, type, difficulty]
    );

    let theory = {};
    if (tRes.rows.length) {
      try {
        const parsed = JSON.parse(tRes.rows[0].content);
        theory[difficulty] = parsed || { overview: tRes.rows[0].content };
      } catch {
        theory[difficulty] = { overview: tRes.rows[0].content };
      }
    } else {
      theory[difficulty] = { overview: "Theory content not available." };
    }

    // Fetch user progress
    const progRes = await pool.query(
      `SELECT is_read FROM theory_progress WHERE user_id=$1 AND subject=$2 AND type=$3 AND difficulty=$4`,
      [userId, subject, type, difficulty]
    );
    const progress = {};
    progress[difficulty] = progRes.rows.length ? progRes.rows[0].is_read : false;

    // Render EJS page
    res.render("modules", {
      title: `${subject} - ${type} - ${difficulty}`,
      questions,
      theory,
      progress,
      subject,
      type,
      difficulty,
      currentPath: req.originalUrl,
      user: req.user
    });

  } catch (err) {
    console.error("Error loading module:", err);
    req.flash("error_msg", "Failed to load module.");
    res.redirect("/");
  }
});

// POST: MCQ submission
router.post("/:subject/:type/:difficulty", ensureAuth, async (req, res) => {
  const { subject, type, difficulty } = req.params;
  const userId = req.user.id;

  const answers = {};
  for (const key in req.body) {
    if (key.startsWith("q")) answers[key.slice(1)] = req.body[key];
  }

  try {
    const result = await pool.query(
      `SELECT id, question, correct_answer, explanation FROM modules WHERE subject=$1 AND type=$2 AND difficulty=$3 ORDER BY id`,
      [subject, type, difficulty]
    );

    const feedback = result.rows.map(q => {
      const userAnswer = answers[q.id] || "(No Answer)";
      const correctAnswer = q.correct_answer || "";
      const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
      return { ...q, userAnswer, correctAnswer, isCorrect };
    });

    const score = feedback.filter(f => f.isCorrect).length;
    const total = feedback.length;
    const percentage = calculatePercentage(score, total);

    await pool.query(
      `INSERT INTO progress (user_id, subject, type, difficulty, score, total, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
      [userId, subject, type, difficulty, score, total]
    );

    res.render("modulesResult", {
      title: `${subject} - ${difficulty} Results`,
      feedback,
      subject,
      type,
      difficulty,
      score,
      total,
      percentage
    });

  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error submitting answers.");
    res.redirect(`/modules/${subject}/${type}/${difficulty}`);
  }
});

// POST: Mark theory as read
router.post("/mark-theory-read", ensureAuth, async (req, res) => {
  const { subject, type, difficulty } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      `INSERT INTO theory_progress (user_id, subject, type, difficulty, is_read)
       VALUES ($1,$2,$3,$4,true)
       ON CONFLICT (user_id, subject, type, difficulty)
       DO UPDATE SET is_read=true`,
      [userId, subject, type, difficulty]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
