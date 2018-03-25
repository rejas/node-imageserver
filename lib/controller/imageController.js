const fs = require('fs'),
    path = require('path');

// Mime types
const mime = {
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml'
};

class ImageController {
    constructor(winston, config) {
        this.winston = winston;
        this.config = config;
    }

    async getImage(req, res, next) {
        this.winston.info('get Image', req.params);

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
        return next();
    };
}

module.exports = {
    ImageController: ImageController
};
