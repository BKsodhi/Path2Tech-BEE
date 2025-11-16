// routes/admin.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { ensureAuth } = require("../middleware/auth");
const { ensureAdmin } = require("../middleware/admin");

// ------------------- ADMIN DASHBOARD -------------------
router.get("/dashboard", ensureAuth, ensureAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM modules ORDER BY id ASC");
    const questions = result.rows; // get array of questions
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      questions,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Unable to load dashboard.");
    res.redirect("/login");
  }
});

// ------------------- ADD QUESTION PAGE -------------------
router.get("/add", ensureAuth, ensureAdmin, (req, res) => {
  res.render("admin/add", { title: "Add Question", user: req.user });
});

// ------------------- ADD QUESTION -------------------
router.post("/add", ensureAuth, ensureAdmin, async (req, res) => {
  const { subject, type, difficulty, question, options, correct_answer, explanation } = req.body;

  try {
    await pool.query(
      `INSERT INTO modules (subject, type, difficulty, question, options, correct_answer, explanation)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [subject, type, difficulty, question, options.split(","), correct_answer, explanation]
    );

    req.flash("success_msg", "Question added successfully!");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Failed to add question.");
    res.redirect("/admin/dashboard");
  }
});

// ------------------- EDIT QUESTION PAGE -------------------
router.get("/edit/:id", ensureAuth, ensureAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM modules WHERE id=$1", [id]);
    if (result.rows.length === 0) {
      req.flash("error_msg", "Question not found.");
      return res.redirect("/admin/dashboard");
    }

    const question = result.rows[0];
    res.render("admin/edit", { title: "Edit Question", question, user: req.user });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Unable to load question.");
    res.redirect("/admin/dashboard");
  }
});

// ------------------- UPDATE QUESTION -------------------
router.post("/edit/:id", ensureAuth, ensureAdmin, async (req, res) => {
  const { id } = req.params;
  const { subject, type, difficulty, question, options, correct_answer, explanation } = req.body;

  try {
    await pool.query(
      `UPDATE modules
       SET subject=$1, type=$2, difficulty=$3, question=$4, options=$5, correct_answer=$6, explanation=$7
       WHERE id=$8`,
      [subject, type, difficulty, question, options.split(","), correct_answer, explanation, id]
    );

    req.flash("success_msg", "Question updated successfully!");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Failed to update question.");
    res.redirect("/admin/dashboard");
  }
});

// ------------------- DELETE QUESTION -------------------
router.post("/delete/:id", ensureAuth, ensureAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM modules WHERE id=$1", [id]);
    req.flash("success_msg", "Question deleted successfully!");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Failed to delete question.");
    res.redirect("/admin/dashboard");
  }
});

module.exports = router;




