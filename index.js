import winston from 'winston';
import config from './config.js';
import {Server} from './lib/server.js';
import {EchoController} from './lib/controller/echoController.js';
import {ImageController} from './lib/controller/imageController.js';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console(),
        //new winston.transports.File({ filename: 'logfile.log' })
    ]
});

const server = new Server(config, logger);
const echoController = new EchoController(logger);
const imageController = new ImageController(logger, config);

const routes = [
    {
        path: '/echo/:name',
        method: 'get',
        controller: echoController.echo.bind(echoController)
    },
    {
        path: '/image/:name/:ext',
        method: 'get',
        controller: imageController.getImage.bind(imageController)
    },
    {
        path: '/image/:name/:ext/:width',
        method: 'get',
        controller: imageController.getImageByWidth.bind(imageController)
    },
    {
        path: '/image/:name/:ext/:width/:height',
        method: 'get',
        controller: imageController.getImageByDimensions.bind(imageController)
    }
];

server.run(process.env.PORT || config.server.port, routes);
