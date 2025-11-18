const express = require("express");
const pool = require("../db");
const router = express.Router();
const { calculatePercentage } = require("../utils/progressUtil");
const { ensureAuth } = require("../middleware/auth");

// Show MCQs
router.get("/:subject/:type/:difficulty", ensureAuth, async (req, res) => {
  const { subject, type, difficulty } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM modules WHERE subject=$1 AND type=$2 AND difficulty=$3 ORDER BY id`,
      [subject, type, difficulty]
    );

    const questions = result.rows.map(q => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || "[]")
    }));

    res.render("modules", {
      title: `${subject} - ${type} - ${difficulty}`,
      questions,
      subject,
      type,
      difficulty,
      currentPath: req.originalUrl,
      user: req.user
    });
  } catch (err) {
    console.error("Error fetching questions:", err);
    req.flash("error_msg", "Failed to load questions.");
    res.redirect("/");
  }
});

// Handle submission
router.post("/:subject/:type/:difficulty", ensureAuth, async (req, res) => {
  const { subject, type, difficulty } = req.params;
  const user_id = req.user.id;

  const answers = {};
  for (const key in req.body) {
    if (key.startsWith("q")) {
      const id = key.slice(1);
      answers[id] = req.body[key];
    }
  }

  try {
    const result = await pool.query(
      `SELECT id, question, correct_answer, explanation 
       FROM modules 
       WHERE subject=$1 AND type=$2 AND difficulty=$3
       ORDER BY id`,
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
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [user_id, subject, type, difficulty, score, total]
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
    console.error("Error processing submission:", err);
    req.flash("error_msg", "Error submitting your answers.");
    res.redirect(`/modules/${subject}/${type}/${difficulty}`);
  }
});

module.exports = router;
