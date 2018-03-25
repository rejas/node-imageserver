const restify = require('restify'),
    info = require('../package.json');

// Packages
const fs = require('fs'),
    path = require('path');

// Mime types
const mime = {
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml'
};

class Server {
    constructor(config, winston) {
        this.config = config;
        this.winston = winston;

        this.server = restify.createServer({
            name: info.name,
            version: info.version
        });

        this.server.use(restify.plugins.acceptParser(this.server.acceptable));
        this.server.use(restify.plugins.queryParser());
        this.server.use(restify.plugins.bodyParser());
    }

    run(port) {

        this.server.get('/echo/:name', (req, res, next) => {
            res.send(req.params);
            return next();
        });

        this.server.get('/image/:name/:ext', (req, res, next) => {

            const type = mime[req.params.ext] || 'text/plain';
            res.header('Content-Type', type);

            let targetFile = path.join(this.config.images.cache, req.params.name + '.' + req.params.ext),
                readStream;

            if (fs.existsSync(targetFile)) {

                readStream = fs.createReadStream(targetFile);
            } else {

                const file = path.join(this.config.images.dir, req.params.name + '.' + req.params.ext);
                fs.copyFileSync(file, targetFile);

                readStream = fs.createReadStream(file);
            }

            readStream.pipe(res);
            next();
        });


        this.server.listen(port, () => {
            this.winston.info('%s listening at %s', this.server.name, this.server.url);
        });
    }
}

module.exports = {
    Server: Server
};
