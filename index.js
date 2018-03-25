const Server = require('./lib/server').Server;
const config = require('./config.js');
const winston = require('winston');

const server = new Server(config, winston);

server.run(process.env.PORT || config.server.port);
