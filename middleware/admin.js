//admin.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "jwttoken";

function ensureAdmin(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    req.flash("error_msg", "Please log in first.");
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      req.flash("error_msg", "Access denied.");
      return res.redirect("/");
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    req.flash("error_msg", "Session expired. Please log in again.");
    res.redirect("/login");
  }
}

module.exports = { ensureAdmin };

