import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import mongoose from 'mongoose';

import { logErrors, errorHandler } from './core/error-handler';
import { routes } from './routes/movies';

const dbUrl = 'mongodb://localhost:27017/media';
mongoose.connect(dbUrl);

const app = express();

app.server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(logErrors);
app.use(errorHandler);

routes(app);

app.server.listen(process.env.PORT || 3001);
console.log(`Express server listening on port ${app.server.address().port}`);

export default app;
