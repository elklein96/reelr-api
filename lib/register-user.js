const mongoose = require('mongoose');
const crypto = require('crypto');
const readline = require('readline');

const dbUrl = 'mongodb://localhost:27017/media';

mongoose.Promise = global.Promise;
mongoose.connect(dbUrl);

const userSchema = mongoose.Schema({
    username        : String,
    hashedPassword  : String,
    salt            : String
});
const User = mongoose.model('User', userSchema);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

getUsername()
    .then(getPassword)
    .then(saltAndHashPassword)
    .then(addUserToMongo)
    .then((data) => {
        console.log('Success!');
        rl.close();
        process.exit(0);
    })
    .catch((error) => {
        console.error(`Failed to add user with error: ${error}`);
        rl.close();
        process.exit(1);
    });

function getUsername() {
    return new Promise((resolve, reject) => {
        rl.question('> Enter the new username: ', (username) => {
            resolve(username);
        });
    });
}

function getPassword(username) {
    return new Promise((resolve, reject) => {
        rl.question(`> Enter the password for ${username}: `, (password) => {
            resolve({ username, password });
        });
    });
}

function saltAndHashPassword(userData) {
    return new Promise((resolve, reject) => {
        const salt = generateSalt(16);
        const hashedPassword = sha512(userData.password, salt);
        resolve({
            username: userData.username,
            hashedPassword,
            salt
        });
    });
}

function addUserToMongo(hashedUserData) {
    return new Promise((resolve, reject) => {
        const user = User(hashedUserData);
        user.save({}, (err) => {
            return err ? reject(err) : resolve({ data: 'success' });
        });
    });
}

function generateSalt(length) {
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex')
        .slice(0, length);
}

function sha512(password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('hex');
}
