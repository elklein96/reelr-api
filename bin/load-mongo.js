const fs = require('fs');
const request = require('request');
const mongoose = require('mongoose');

const tmdbKey = require('../config.json').tmdb_api_key;
const batchDir = require('../config.json').movie_base_directory;
const dbUrl = 'mongodb://localhost:27017/media';

mongoose.Promise = global.Promise;
mongoose.connect(dbUrl);

const movieSchema = mongoose.Schema({
    director    : String,
    duration    : String,
    genre       : [ String ],
    id          : String,
    path        : String,
    plot        : String,
    poster_url  : String,
    title       : String,
    year        : String
});

const Movie = mongoose.model('Movie', movieSchema);
const batch = fs.readdirSync(batchDir);
let batchCounter = 0;

iterateOverBatch();

function iterateOverBatch () {
    // Rate limiting for TMDB API
    setTimeout(() => {
        if (batchCounter < batch.length) {
            processMovie(batch[batchCounter++]);
            iterateOverBatch();
        } else {
            process.exit(0);
        }
    }, 1000);
}

function processMovie (movie) {
    if (movie.charAt(0) !== '.') {
        findMovieByTitle(movie)
            .then(getMovieDataById)
            .then(addMovieToMongo)
            .then((data) => {
                console.log(`Successfully added ${data.title}`);
            })
            .catch((err) => {
                console.log(`ERROR:: ${err}`);
            });
    }

    function findMovieByTitle (movie) {
        return new Promise ((resolve, reject) => {
            const options = {
                url: `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${movie}
                    &page=1&include_adult=false&language=en-US`,
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
                json: true
            };

            request(options, (err, res, body) => {
                return err ? reject(err) : resolve(body);
            });
        });
    }

    function addMovieToMongo (data) {
        return new Promise ((resolve, reject) => {
            const movieDir = fs.readdirSync(`${batchDir}/${data.title}`);

            if (movieDir.length > 1) {
                console.log(`WARNING:: Found multiple files in ${batchDir}/${data.title}. Selected ${movieDir[0]} as the media file`);
            } else if (movieDir.length <= 0) {
                reject(`Could not find media file in ${batchDir}/${data.title}`);
            }

            const movie = Movie({
                director    : '',
                duration    : data.runtime,
                genre       : data.genres.reduce((acc, val) => { return acc.concat(val.name); }, []),
                id          : data.imdb_id,
                path        : `/media/Movies/${data.title}/${movieDir[0]}`,
                plot        : data.overview,
                poster_url  : `https://image.tmdb.org/t/p/w640/${data.poster_path}`,
                title       : data.title,
                year        : data.release_date
            });

            movie.save({}, (err, movies) => {
                return err ? reject(err) : resolve({ title: data.title });
            });
        });
    }
}
