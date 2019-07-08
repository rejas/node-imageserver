class EchoController {
    constructor(winston) {
        this.winston = winston;
    }

    async echo(req, res, next) {
        this.winston.info('get Echo', req.params);
        res.send(req.params);
        return next();
    }
}

module.exports = {
    EchoController: EchoController
};
