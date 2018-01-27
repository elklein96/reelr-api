import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    username        : String,
    hashedPassword  : String,
    salt            : String
});

export default mongoose.model('User', userSchema);
