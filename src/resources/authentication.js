import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../core/models/user.model';

const envConfig = require('../../config.json');

export function logIn(req, res, next) {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            return sendResponse(500, err, res, next);
        }
        if (!user) {
            return sendResponse(401, { message: 'Incorrect username.' }, res, next);
        }
        user = user.toObject();
        if (!isValidPassword(user, req.body.password)) {
            return sendResponse(401, { message: 'Incorrect password.' }, res, next);
        }
        setJwt(user, res);
        return sendResponse(200, { message: 'Ok.' }, res, next);
    });
}

export function verifyJwt(req, res, next) {
    const token = req.cookies.reelr_jwt;

    if (!token) {
        return sendResponse(401, { message: 'Missing authentication cookie.' }, res, next);
    }

    jwt.verify(token, envConfig.jwt_secret_key, (err, decoded) => {
        if (err) {
            return sendResponse(401, { message: 'Invalid authentication cookie.' }, res, next);
        }
        return sendResponse(200, { message: 'Ok.' }, res, next);
    });
}

export function logOut(req, res, next) {
    res.clearCookie('reelr_jwt');
    return sendResponse(200, { message: 'Ok.' }, res, next);
}

function sendResponse(status, message, res, next) {
    res.status(status).send(message);
}

function setJwt(user, res) {
    const token = jwt.sign({ username: user.username }, envConfig.jwt_secret_key);
    res.cookie('reelr_jwt', token);
}

function isValidPassword(user, password) {
    const hashedLoginValue = sha512(password, user.salt);
    return hashedLoginValue === user.hashedPassword;
}

function sha512(password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('hex');
}
