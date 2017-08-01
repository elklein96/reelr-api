import mongoose from 'mongoose';
import request from 'request';

import Movie from '../core/movie.model';

const tmdbKey = require('../../config.json').tmdb_api_key;

export function getMovies (req, res, next) {
    let movieList = [];
    const query = (req.query.id) ? { 'title': req.query.id } : {};

    Movie.find(query, (err, movies) => {
        if (err) {
            return next(err);
        } else {
            movieList = movies.map((movie) => {
                return {
                    counter   : movie.counter,
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

export function createMovie (req, res, next) {
    findMovieByTitleAndYear()
        .then(getMovieDataById)
        .then(addMovieToMongo)
        .then((data) => {
            res.status(200).send(data);
            return next();
        })
        .catch(next);

    function findMovieByTitleAndYear () {
        return new Promise ((resolve, reject) => {
            const movie = req.body.movie;
            const options = {
                url: `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${movie.title}
                        &primary_release_year=${movie.year}&page=1&include_adult=false&language=en-US`,
                headers: { 'User-Agent': 'request' },
                json: true
            };

            request(options, (err, res, body) => {
                return err ? reject(err) : resolve(body.results[0].id);
            });
        });
    }

    function getMovieDataById (id) {
        return new Promise ((resolve, reject) => {
            const options = {
                url: `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbKey}&language=en-US`,
                headers: { 'User-Agent': 'request' },
                json: true
            };

            request(options, (err, res, body) => {
                return err ? reject(err) : resolve(body);
            });
        });
    }

    function addMovieToMongo (data) {
        return new Promise ((resolve, reject) => {
            const movie = Movie({
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
                return err ? reject(err) : resolve({ data: 'success' });
            });
        });
    }
}
