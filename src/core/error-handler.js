export function logErrors (err, req, res, next) {
    console.error(err.stack);
    next(err);
}

export function errorHandler (err, req, res, next) {
    return res.status(500).send('error', { err });
}
