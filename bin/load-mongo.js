const fs = require('fs');
const request = require('request');
const mongoose = require('mongoose');

const tmdbKey = require('../config.json').tmdb_api_key;
const movieDir = require('../config.json').movie_base_directory;
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
const batch = fs.readdirSync(movieDir);
let batchCounter = 0;

iterateOverBatch();

function iterateOverBatch () {
    setTimeout(() => {
        processMovie(batch[batchCounter++]);
        iterateOverBatch();
    }, 333);
}

function processMovie (movie) {
    findMovieByTitle()
        .then(getMovieDataById)
        .then(addMovieToMongo)
        .then((data) => {
            console.log('Success');
        })
        .catch((err) => {
            console.log(`Error: ${err}`);
        });

    function findMovieByTitle () {
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
            const movie = Movie({
                director    : '',
                duration    : data.runtime,
                genre       : data.genres.reduce((acc, val) => { return acc.concat(val.name); }, []),
                id          : data.imdb_id,
                path        : '',
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
