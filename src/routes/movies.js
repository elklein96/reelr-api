import mongoose from 'mongoose';
import request from 'request';

import Movie from '../core/movie.model';

export function routes(app) {

    app.get('/api/movies/:id?', getMovies);
    app.post('/api/movies', createMovie);

    function getMovies(req, res, next) {
        const movieList = [];
        const query = (req.query.id) ? { 'title': req.query.id } : {};

        Movie.find(query, (err, movies) => {
            if (err) {
                next(err);
            } else {
                movies.forEach((movieDoc) => {
                    movieList.push({
                        counter     : movieDoc.counter,
                        director    : movieDoc.director,
                        duration    : movieDoc.duration,
                        genre       : movieDoc.genre,
                        id          : movieDoc.id,
                        path        : movieDoc.path,
                        plot        : movieDoc.plot,
                        posterUrl   : movieDoc.poster_url,
                        title       : movieDoc.title,
                        year        : movieDoc.year
                    });
                });

                const status = movieList.length > 0 ? 200 : 404;

                res.status(status).send({ data: movieList });
            }
        });
    }

    function createMovie(req, res, next) {
        const tmdbKey = require('../../config.json').tmdb_api_key;

        findMovieByTitleAndYear()
            .then(getMovieDataById)
            .then(addMovieToMongo)
            .then(res.status(200).send)
            .catch(next);

        function findMovieByTitleAndYear() {
            return new Promise(function(resolve, reject) {
                const movie = req.body.movie;
                const options = {
                    url: `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${movie.title}
                            &primary_release_year=${movie.year}&page=1&include_adult=false&language=en-US`,
                    headers: { 'User-Agent': 'request' }
                };

                request(options, function(err, res, body) {
                    if (err) {
                        reject(err);
                    }
                    const id = JSON.parse(body).results[0].id;
                    resolve(id);
                });
            });
        }

        function getMovieDataById(id) {
            return new Promise(function(resolve, reject) {    
                const options = {
                    url: `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbKey}&language=en-US`,
                    headers: { 'User-Agent': 'request' }
                };

                request(options, function(err, res, body) {
                    err ? reject(err) : resolve(JSON.parse(body));
                });
            });
        }

        function addMovieToMongo(data) {
            return new Promise(function(resolve, reject) {
                const movie = mongoose.Movie({
                    director    : '',
                    duration    : data.runtime,
                    genre       : data.genres[0].name,
                    id          : data.imdb_id,
                    path        : '',
                    plot        : data.overview,
                    poster_url  : 'https://image.tmdb.org/t/p/w640/' + data.poster_path,
                    title       : data.title,
                    year        : data.release_date
                });

                movie.save({}, (err, movies) => {
                    err ? reject(err) : resolve({ data: 'success' });
                });
            });
        }
    }
}
