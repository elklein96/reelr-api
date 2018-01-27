import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from 'passport';
import http from 'http';
import mongoose from 'mongoose';

import './core/authentication-handler';
import { logErrors, errorHandler } from './core/error-handler';
import * as movies from './resources/movies';

const environmentConfigs = require('../config.json');

const dbUrl = 'mongodb://localhost:27017/media';
const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(dbUrl);

app.server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: environmentConfigs.session_secret_key, 
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(logErrors);
app.use(errorHandler);

app.get('/api/movies', movies.getMovies);
app.get('/api/movies/all', movies.getMovieByTitle);
app.post('/api/movies', movies.createMovie);
app.post('/api/login', passport.authenticate('local-login', { 
    successRedirect: environmentConfigs.proxy_success_route,
    failureRedirect: environmentConfigs.proxy_failure_route,
    failureFlash: false 
}));

app.server.listen(process.env.PORT || 3001);
console.log(`Express server listening on port ${app.server.address().port}`);

export default app;
