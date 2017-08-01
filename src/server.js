import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import mongoose from 'mongoose';

import { logErrors, errorHandler } from './core/error-handler';
import * as movies from './resources/movies';

const dbUrl = 'mongodb://localhost:27017/media';
const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(dbUrl);

app.server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(logErrors);
app.use(errorHandler);

app.get('/api/movies/:id?', movies.getMovies);
app.post('/api/movies', movies.createMovie);

app.server.listen(process.env.PORT || 3001);
console.log(`Express server listening on port ${app.server.address().port}`);

export default app;
