// const express = require("express");
// const bodyParser = require("body-parser");
// const expressLayouts = require("express-ejs-layouts");
// const session = require("express-session");
// const flash = require("connect-flash");
// const path = require("path");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");

// // Routes
// const progressRoutes = require("./routes/progress");
// const moduleRoutes = require("./routes/modules");
// const authRoutes = require("./routes/auth");
// const adminRoutes = require("./routes/admin");

// // Middleware
// const { ensureAuth, ensureGuest, logger, errorHandler } = require("./middleware/auth");

// const JWT_SECRET = "jwttoken"; // Hardcoded secret
// const SESSION_SECRET = "path2tech_secret"; // Hardcoded session secret

// const app = express();

// // ------------------- Middleware Setup -------------------

// // Body parser
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Cookie parser
// app.use(cookieParser());

// // Session setup
// app.use(
//   session({
//     secret: SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 }, // 1 hour
//   })
// );

// // Flash messages
// app.use(flash());

// // Logger
// app.use(logger);

// // EJS setup
// app.use(expressLayouts);
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.set("layout", "partials/layout");

// // JWT middleware: attach user to request if token exists
// app.use((req, res, next) => {
//   const token = req.cookies?.token;
//   if (token) {
//     try {
//       const decoded = jwt.verify(token, JWT_SECRET);
//       req.user = decoded;
//     } catch {
//       res.clearCookie("token");
//     }
//   }
//   next();
// });

// // Global template variables
// app.use((req, res, next) => {
//   res.locals.user = req.user || null;
//   res.locals.success_msg = req.flash("success_msg");
//   res.locals.error_msg = req.flash("error_msg");
//   res.locals.currentPath = req.path;
//   next();
// });

// // ------------------- Routes -------------------

// // Auth routes (login, register, logout)
// app.use("/", authRoutes);

// // Protected routes
// app.use("/progress", ensureAuth, progressRoutes);
// app.use("/modules", ensureAuth, moduleRoutes);
// app.use("/admin", ensureAuth, adminRoutes);

// // ------------------- Default Route -------------------
// // Redirect to login if not logged in
// app.get("/", (req, res) => {
//   if (!req.user) return res.redirect("/login");

//   // If admin, redirect to admin dashboard
//   if (req.user.role === "admin") return res.redirect("/admin/dashboard");

//   // Normal user → index/home page
//   res.render("index", { title: "Home - Path2Tech" });
// });

// // ------------------- 404 handler -------------------
// app.use((req, res) => {
//   res.status(404).render("error", {
//     title: "404 - Not Found",
//     message: "Page not found.",
//   });
// });

// // ------------------- Error handling -------------------
// app.use(errorHandler);

// // ------------------- Start Server -------------------
// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));



const express = require("express");
const bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

// Routes
const progressRoutes = require("./routes/progress");
const moduleRoutes = require("./routes/modules");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

// ✅ New route for Coding Challenges
const codingRoutes = require("./routes/coding");

// Middleware
const { ensureAuth, ensureGuest, logger, errorHandler } = require("./middleware/auth");

const JWT_SECRET = "jwttoken"; // Hardcoded secret
const SESSION_SECRET = "path2tech_secret"; // Hardcoded session secret

const app = express();

// ------------------- Middleware Setup -------------------

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Session setup
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 }, // 1 hour
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

// JWT middleware: attach user to request if token exists
app.use((req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
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

// ------------------- Routes -------------------

// Auth routes (login, register, logout)
app.use("/", authRoutes);

// Protected routes
app.use("/progress", ensureAuth, progressRoutes);
app.use("/modules", ensureAuth, moduleRoutes);
app.use("/admin", ensureAuth, adminRoutes);

// ✅ New Coding route
app.use("/coding", ensureAuth, codingRoutes);

// ------------------- Default Route -------------------
// Redirect to login if not logged in
app.get("/", (req, res) => {
  if (!req.user) return res.redirect("/login");

  // If admin, redirect to admin dashboard
  if (req.user.role === "admin") return res.redirect("/admin/dashboard");

  // Normal user → index/home page
  res.render("index", { title: "Home - Path2Tech" });
});

// ------------------- 404 handler -------------------
app.use((req, res) => {
  res.status(404).render("error", {
    title: "404 - Not Found",
    message: "Page not found.",
  });
});

// ------------------- Error handling -------------------
app.use(errorHandler);

// ------------------- Start Server -------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));






