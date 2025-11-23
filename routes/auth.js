import express from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login.ejs');
});

router.get('/register', (req, res) => {
    res.render('register.ejs');
});

router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
    })
);

router.post('/register', async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    try {
        const checkResult = await db.query('SELECT * FROM users WHERE email = $1', [
            email,
        ]);

        if (checkResult.rows.length > 0) {
            res.redirect('/login');
        } else {
            bcrypt.hash(password, 10, async (err, hash) => {
                if (err) {
                    console.error('Error hashing password:', err);
                } else {
                    const result = await db.query(
                        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
                        [email, hash]
                    );
                    const user = result.rows[0];
                    req.login(user, (err) => {
                        console.log('success');
                        res.redirect('/');
                    });
                }
            });
        }
    } catch (err) {
        console.log(err);
    }
});

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

export default router;
