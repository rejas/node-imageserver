const config = require('./config.js');
const winston = require('winston');

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

const Server = require('./lib/server').Server;
const server = new Server(config, logger);

const EchoController = require('./lib/controller/echoController').EchoController;
const echoController = new EchoController(logger);

const ImageController = require('./lib/controller/imageController').ImageController;
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
