import request from 'request';

import Movie from '../core/models/movie.model';

const tmdbKey = require('../../config.json').tmdb_api_key;
const movieSchema = Object.keys(Movie.schema.obj);

export function getMovies(req, res, next) {
    const query = Object.keys(req.query).filter((el) => {
        return movieSchema.includes(el);
    }).reduce((accumulator, val) => {
        accumulator[val] = new RegExp(req.query[val], 'i');
        return accumulator;
    }, {});

    Movie.find(query).sort({ title: 1 }).exec((err, movies) => {
        if (err) {
            return next(err);
        } else {
            const movieList = movies.map((movie) => {
                return {
                    director  : movie.director,
                    duration  : movie.duration,
                    genre     : movie.genre,
                    id        : movie.id,
                    path      : movie.path,
                    plot      : movie.plot,
                    posterUrl : movie.poster_url,
                    title     : movie.title,
                    year      : movie.year
                };
            });

            const status = movieList.length > 0 ? 200 : 404;

            res.status(status).send({ data: movieList });
            return next();
        }
    });
}

export function getMovieByTitle(req, res, next) {
    queryMovieByTitle()
        .then((data) => {
            data = data.map((el) => {
                const obj = {
                    title: el.title,
                    date: el.release_date,
                    poster: el.poster_path
                };
                return obj;
            });

            res.status(200).send(data);
            return next();
        })
        .catch(next);

    function queryMovieByTitle() {
        return new Promise((resolve, reject) => {
            const movie = req.query.movie;
            const options = {
                url: `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${movie}
                    &page=1&include_adult=false&language=en-US`,
                json: true
            };

            request(options, (err, res, body) => {
                return err ? reject(err) : resolve(body.results);
            });
        });
    }
}

export function createMovie(req, res, next) {
    findMovieByTitleAndYear()
        .then(getMovieDataById)
        .then(addMovieToMongo)
        .then((data) => {
            res.status(200).send(data);
            return next();
        })
        .catch(next);

    function findMovieByTitleAndYear() {
        return new Promise((resolve, reject) => {
            const movie = req.body.movie;
            const options = {
                url: `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${movie.title}
                        &primary_release_year=${movie.year}&page=1&include_adult=false&language=en-US`,
                json: true
            };

            request(options, (err, res, body) => {
                return err ? reject(err) : resolve(body.results[0].id);
            });
        });
    }

    function getMovieDataById(id) {
        return new Promise((resolve, reject) => {
            const options = {
                url: `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbKey}&language=en-US`,
                json: true
            };

            request(options, (err, res, body) => {
                return err ? reject(err) : resolve(body);
            });
        });
    }

    function addMovieToMongo(data) {
        return new Promise((resolve, reject) => {
            const movie = Movie({
                director    : '',
                duration    : data.runtime,
                genre       : data.genres.reduce((acc, val) => { return acc.concat(val.name); }, []),
                id          : data.imdb_id,
                path        : `/media/Movies/${data.title}`,
                plot        : data.overview,
                poster_url  : `https://image.tmdb.org/t/p/w640/${data.poster_path}`,
                title       : data.title,
                year        : data.release_date
            });

            movie.save({}, (err, movies) => {
                return err ? reject(err) : resolve({ data: 'success' });
            });
        });
    }
}
