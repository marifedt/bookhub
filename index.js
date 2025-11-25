import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import pgSession from 'connect-pg-simple';
import { connectDB } from './db.js';
import db from './db.js';
import bookRoutes from './routes/bookRoutes.js';
import authRoutes from './routes/auth.js';
import './config/passport.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const PgSession = pgSession(session);
app.use(
  session({
    store: new PgSession({
      pool: db,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRoutes);

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

app.use('/', isAuthenticated, bookRoutes);

// Handle 404 Requests
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Handle all errors
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//Startup Function
if (process.env.NODE_ENV !== 'test') {
  async function startServer() {
    try {
      await connectDB();

      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });

    } catch (err) {
      process.exit(1);
    }
  }
  startServer();
}

export default app;
