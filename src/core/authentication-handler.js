import passport from 'passport';
import crypto from 'crypto';
import LocalStrategy from 'passport-local';

import User from './models/user.model';

const passportConfig = {
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
};

passport.use('local-login', new LocalStrategy(passportConfig,
    (req, username, password, done) => {
        User.findOne({ username: username }, (err, user) => {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            user = user.toObject();
            if (!isValidPassword(user, password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

function isValidPassword (user, password) {
    const hashedLoginValue = sha512(password, user.salt);
    return hashedLoginValue === user.hashedPassword;
}

function sha512(password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('hex');
}
