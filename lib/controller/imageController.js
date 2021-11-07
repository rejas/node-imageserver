import fs from 'fs';
import fse from 'fs-extra';
import glob from 'glob';
import path from 'path';
import sharp from 'sharp';
import {supportedTypes} from '../supportedTypes.js';

export class ImageController {

    constructor(winston, config) {
        this.winston = winston;
        this.config = config;
    }

    static createImageStream(target, res, ext) {

        // Set mime type
        const type = supportedTypes[ext] || 'text/plain';
        res.header('Content-Type', type);

        //
        let readStream = fs.createReadStream(target);
        readStream.pipe(res);
    }

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
                        this.winston.info('original Image', originalFile);

                        reject({org: originalFile, target: targetFile});
                    }
                });
            }
        });
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

        let targetFile;

        this.createImagePromise(req.params).then((result) => {
            this.winston.info('return cached Image', result);
            targetFile = result.target;

            ImageController.createImageStream(result.target, res, req.params.ext);
            return next();
        }, (reject) => {
            this.winston.info('generate new Image');
            targetFile = reject.target;

            sharp(reject.org)
                .toFile(targetFile)
                .then(() => {
                    ImageController.createImageStream(targetFile, res, req.params.ext);
                    return next();
                });
        });
    }

    async getImageByWidth(req, res, next) {
        this.winston.info('get Image by width', req.params);

        let targetFile;

        this.createImagePromise(req.params).then((result) => {
            this.winston.info('return cached Image', result);
            targetFile = result.target;

            ImageController.createImageStream(result.target, res, req.params.ext);
            return next();
        }, (reject) => {
            this.winston.info('generate new Image');
            targetFile = reject.target;

            sharp(reject.org)
                .resize(parseInt(req.params.width))
                .toFile(targetFile)
                .then(() => {
                    ImageController.createImageStream(targetFile, res, req.params.ext);
                    return next();
                });
        });
    }

    async getImageByDimensions(req, res, next) {
        this.winston.info('get Image by dimensions', req.params);

        let targetFile;

        this.createImagePromise(req.params).then((result) => {
            this.winston.info('return cached Image', result);
            targetFile = result.target;

            ImageController.createImageStream(result.target, res, req.params.ext);
            return next();
        }, (reject) => {
            this.winston.info('generate new Image');
            targetFile = reject.target;

            sharp(reject.org)
                .resize(parseInt(req.params.width), parseInt(req.params.height))
                .toFile(targetFile)
                .then(() => {
                    ImageController.createImageStream(targetFile, res, req.params.ext);
                    return next();
                });
        });
    }
}
