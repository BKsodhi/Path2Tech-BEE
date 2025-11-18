// Core modules
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const axios = require("axios");

// Routes
const progressRoutes = require("./routes/progress");
const moduleRoutes = require("./routes/modules");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const codingRoutes = require("./routes/coding");


// Middleware
const { ensureAuth, ensureGuest, logger, errorHandler } = require("./middleware/auth");

// Secrets
const JWT_SECRET = "jwttoken";
const SESSION_SECRET = "path2tech_secret";

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Session setup
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 },
  })
);

// Flash messages
app.use(flash());

// Logger
app.use(logger);

// EJS setup
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "partials/layout");

// Static files
app.use(express.static(path.join(__dirname, "public")));

// JWT user verification
app.use((req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      res.clearCookie("token");
    }
  }
  next();
});

// Global template variables
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.currentPath = req.path;
  next();
});

// Auth routes
app.use("/", authRoutes);

// Protected routes
app.use("/progress", ensureAuth, progressRoutes);
app.use("/modules", ensureAuth, moduleRoutes);
app.use("/admin", ensureAuth, adminRoutes);
app.use("/coding", ensureAuth, codingRoutes);

// Home route
app.get("/", (req, res) => {
  if (!req.user) return res.redirect("/login");
  if (req.user.role === "admin") return res.redirect("/admin/dashboard");
  res.render("index", { title: "Home - Path2Tech" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("error", {
    title: "404 - Not Found",
    message: "Page not found.",
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
