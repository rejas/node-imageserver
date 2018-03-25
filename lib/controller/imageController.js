const fs = require('fs'),
    glob = require('glob'),
    path = require('path'),
    sharp = require('sharp');

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

        const targetDir = path.join(this.config.images.cache, req.params.ext),
            targetFile = path.join(targetDir, req.params.name + '.' + req.params.ext),
            type = mime[req.params.ext] || 'text/plain';

        let readStream;

        // Set mime type
        res.header('Content-Type', type);

        // File already exists in cache
        if (fs.existsSync(targetFile)) {
            this.winston.info('cached Image', targetFile);
            readStream = fs.createReadStream(targetFile);
            readStream.pipe(res);
            return next();
        }

        // Create target dir if it does not exist
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir);
        }

        // Get original file
        const fileName = path.join(this.config.images.upload, req.params.name);
        glob(fileName + '.*', (err, files) => {

            if (files.length > 0) {
                let originalFile = files[0];
                this.winston.info('original Image', originalFile);

                // Create new file in cache
                sharp(originalFile)
                    .toFile(targetFile)
                    .then(() => {
                        // Return new file
                        readStream = fs.createReadStream(targetFile);
                        readStream.pipe(res);
                        return next();
                    });
            }
        });
    };
}

module.exports = {
    ImageController: ImageController
};
