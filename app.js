// Load environment variables in development mode
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Import required modules
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require("method-override");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');

// Import route handlers
const userRoutes = require('./routes/users');
const campgroundRoutes = require("./routes/campground");
const reviewRoutes = require("./routes/reviews");

// Connect to MongoDB
const dbUrl = process.env.DB_URL;
// const dbUrl = "mongodb+srv://yourUsername:yourPassword@yourCluster.mongodb.net/yelp-camp";
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// Initialize Express app
const app = express();

// Set up EJS as the templating engine
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(methodOverride("_method")); // Support PUT and DELETE methods
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(mongoSanitize()); // Prevent NoSQL injection attacks by sanitizing user input

// Configure session store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60 // Reduces session updates (once per day)
});

store.on("error", function (err) {
  console.log("SESSION STORE ERROR:", err);
});

// Session configuration
const sessionConfig = {
  store,
  name: 'session',
  secret: process.env.SESSION_SECRET, // Replace with an environment variable in production
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,  // Security measure to prevent client-side access
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Expires in 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

// Configure Helmet CSP (Content Security Policy)
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [
  "https://fonts.gstatic.com",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/"
];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dulxuyia4/",
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

// Configure Passport for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to make flash messages & user available in templates
app.use((req, res, next) => {
  console.log(req.query);
  res.locals.currentUser = req.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Register route handlers
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Home route
app.get("/", (req, res) => {
  res.render("home");
});

// Catch-all route for handling 404 errors
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).render('error', { err });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

