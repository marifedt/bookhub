import passport from 'passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import db from '../db.js';

passport.use(
    new Strategy(async function verify(username, password, cb) {
        try {
            const result = await db.query('SELECT * FROM users WHERE email = $1', [
                username,
            ]);
            if (result.rows.length > 0) {
                const user = result.rows[0];
                const storedHashedPassword = user.password;
                bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                    if (err) {
                        console.error('Error comparing passwords:', err);
                        return cb(err);
                    } else {
                        if (valid) {
                            return cb(null, user);
                        } else {
                            return cb(null, false);
                        }
                    }
                });
            } else {
                return cb(null, false);
            }
        } catch (err) {
            console.log(err);
        }
    })
);

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
});

export default passport;
