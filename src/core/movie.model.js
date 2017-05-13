import mongoose from 'mongoose';

const movieSchema = mongoose.Schema({
    director    : String,
    duration    : String,
    genre       : String,
    id          : String,
    path        : String,
    plot        : String,
    poster_url  : String,
    title       : String,
    year        : String
});

export default mongoose.model('movie', movieSchema);
