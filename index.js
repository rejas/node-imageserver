const config = require('./config.js');
const winston = require('winston');

const Server = require('./lib/server').Server;
const server = new Server(config, winston);

const EchoController = require('./lib/controller/echoController').EchoController;
const echoController = new EchoController(winston);

const ImageController = require('./lib/controller/imageController').ImageController;
const imageController = new ImageController(winston, config);

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
    }
];

server.run(process.env.PORT || config.server.port, routes);
