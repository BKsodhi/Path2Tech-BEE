/*const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ensureGuest, ensureAuth } = require("../middleware/auth");
const { validateRegister } = require("../middleware/validator");

const JWT_SECRET = process.env.JWT_SECRET || "jwttoken";

// ------------------- REGISTER PAGE -------------------
router.get("/register", ensureGuest, (req, res) => {
  res.render("register", {
    layout: "layout-auth",
    title: "Register",
    error_msg: req.flash("error_msg"),
    success_msg: req.flash("success_msg"),
  });
});

// ------------------- REGISTER API -------------------
router.post("/register", validateRegister, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, email, password, is_verified) VALUES ($1, $2, $3, true)`,
      [username, email, hashed]
    );

    req.flash("success_msg", "Registration successful! You can now login.");
    res.redirect("/login");
  } catch (err) {
    console.error("Register error:", err.message);
    req.flash("error_msg", "Username or Email already exists!");
    res.redirect("/register");
  }
});

// ------------------- LOGIN PAGE -------------------
router.get("/login", ensureGuest, (req, res) => {
  res.render("login", {
    layout: "layout-auth",
    title: "Login",
    error_msg: req.flash("error_msg"),
    success_msg: req.flash("success_msg"),
  });
});

// ------------------- LOGIN API -------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userQuery = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);

    if (userQuery.rows.length === 0) {
      req.flash("error_msg", "Invalid credentials");
      return res.redirect("/login");
    }

    const user = userQuery.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      req.flash("error_msg", "Invalid credentials");
      return res.redirect("/login");
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Store JWT in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    });

    req.flash("success_msg", `Welcome back, ${user.username}!`);
    res.redirect("/"); // redirect to homepage after login
  } catch (err) {
    console.error("Login error:", err);
    req.flash("error_msg", "Server error. Please try again.");
    res.redirect("/login");
  }
});

// ------------------- LOGOUT -------------------
router.post("/logout", ensureAuth, (req, res) => {
  res.clearCookie("token");
  req.flash("success_msg", "Logged out successfully.");
  res.redirect("/login");
});

module.exports = router; */
const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ensureGuest, ensureAuth } = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "jwttoken";

// REGISTER PAGE
router.get("/register", ensureGuest, (req, res) => {
  res.render("register", { layout: "layout-auth", title: "Register" });
});

// REGISTER POST
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    req.flash("error_msg", "All fields are required.");
    return res.redirect("/register");
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (username,email,password,is_verified,role) VALUES ($1,$2,$3,true,$4)`,
      [username, email, hashed, role]
    );
    req.flash("success_msg", "Registration successful! Login now.");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Email already exists.");
    res.redirect("/register");
  }
});

// LOGIN PAGE
router.get("/login", ensureGuest, (req, res) => {
  res.render("login", { layout: "layout-auth", title: "Login" });
});

// LOGIN POST
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash("error_msg", "Enter email and password");
    return res.redirect("/login");
  }

  try {
    const userQuery = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (userQuery.rows.length === 0) {
      req.flash("error_msg", "Invalid credentials");
      return res.redirect("/login");
    }

    const user = userQuery.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      req.flash("error_msg", "Invalid credentials");
      return res.redirect("/login");
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    if (user.role === "admin") return res.redirect("/admin/dashboard");
    res.redirect("/"); // normal user
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Server error");
    res.redirect("/login");
  }
});

// LOGOUT
router.post("/logout", ensureAuth, (req, res) => {
  res.clearCookie("token");
  req.flash("success_msg", "Logged out successfully.");
  res.redirect("/login");
});

module.exports = router;
