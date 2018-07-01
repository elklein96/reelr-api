export function logEvent(req, res, next) {
    console.log(req.body.activity);
    res.status(200).send({ data: 'ok' });
    return next();
}
