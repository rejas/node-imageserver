const fs = require('fs'),
    fse = require('fs-extra'),
    glob = require('glob'),
    path = require('path'),
    sharp = require('sharp'),
    supportedTypes = require('../supportedTypes');

class ImageController {

    constructor(winston, config) {
        this.winston = winston;
        this.config = config;
    }

    getImageFromCache(params) {
        const targetDir = path.join(this.config.images.cache, params.ext, params.width || '', params.height || ''),
            targetFile = path.join(targetDir, `${params.name}.${params.ext}`);

        // Create target dir if it does not exist
        if (!fs.existsSync(targetDir)) {
            fse.mkdirsSync(targetDir);
        }

        return targetFile;
    }

    async getImage(req, res, next) {
        this.winston.info('get Image', req.params);

        const type = supportedTypes[req.params.ext] || 'text/plain';

        let targetFile = this.getImageFromCache(req.params),
            readStream;

        // Set mime type
        res.header('Content-Type', type);

        // File already exists in cache
        if (fs.existsSync(targetFile)) {
            this.winston.info('cached Image', targetFile);
            readStream = fs.createReadStream(targetFile);

            console.log(typeof  readStream);

            readStream.pipe(res);
            return next();
        }

        // Get original file
        const fileName = path.join(this.config.images.upload, req.params.name);
        glob(fileName + '.*', (err, files) => {

            // Use first found image in case of multiple extensions uploaded
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

    async getImageByWidth(req, res, next) {
        this.winston.info('get Image by width', req.params);

        const type = supportedTypes[req.params.ext] || 'text/plain';

        let targetFile = this.getImageFromCache(req.params),
            readStream;

        // Set mime type
        res.header('Content-Type', type);

        // File already exists in cache
        if (fs.existsSync(targetFile)) {
            this.winston.info('cached Image', targetFile);
            readStream = fs.createReadStream(targetFile);
            readStream.pipe(res);
            return next();
        }

        // Get original file
        const fileName = path.join(this.config.images.upload, req.params.name);
        glob(fileName + '.*', (err, files) => {

            // Use first found image in case of multiple extensions uploaded
            if (files.length > 0) {
                let originalFile = files[0];
                this.winston.info('original Image', originalFile);

                // Create new file in cache
                sharp(originalFile)
                    .resize(parseInt(req.params.width))
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

    createImagePromise(params) {
        let targetFile = this.getImageFromCache(params);

        // Return new promise
        return new Promise((resolve, reject) => {

            // File already exists in cache
            if (fs.existsSync(targetFile)) {
               // this.winston.info('cached Image', targetFile);
                resolve({target: targetFile});
            } else {

                // Get original file
                const fileName = path.join(this.config.images.upload, params.name);
                glob(fileName + '.*', (err, files) => {

                    // Use first found image in case of multiple extensions uploaded
                    if (files.length > 0) {
                        let originalFile = files[0];
                     //   this.winston.info('original Image', originalFile);

                        reject({org: originalFile, target: targetFile});
                    }
                });
            }
        })
    }

    createImageStream (target, res, ext) {

        // Set mime type
        const type = supportedTypes[ext] || 'text/plain';
        res.header('Content-Type', type);

        //
        let readStream = fs.createReadStream(target);
        readStream.pipe(res);
    }

    async getImageByDimensions(req, res, next) {
        this.winston.info('get Image by dimensions', req.params);

        let targetFile;

        this.createImagePromise(req.params).then((result) => {
            this.winston.info('cached Image', result);
            targetFile = result.target;

            this.createImageStream(result.target, res, req.params.ext);
            return next();
        }, (reject) => {
            this.winston.info('generate new Image');
            targetFile = reject.target;

            sharp(reject.org)
                .resize(parseInt(req.params.width), parseInt(req.params.height))
                .toFile(targetFile)
                .then(() => {
                    this.createImageStream(targetFile, res, req.params.ext);
                    return next();
                });
        });
    }
}

module.exports = {
    ImageController: ImageController
};
