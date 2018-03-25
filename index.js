// Packages
const fs = require('fs'),
    restify = require('restify'),
    path = require('path');

// Configs
const config = require('./config.js'),
    info = require('./package.json');

// Directories
const cache = path.join(__dirname, 'cache'),
    dir = path.join(__dirname, 'public');

// Mime types
const mime = {
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml'
};

// Server
const server = restify.createServer({
    name: info.name,
    version: info.version
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get('/echo/:name', function (req, res, next) {
    res.send(req.params);
    return next();
});

server.get('/image/:name/:ext', function (req, res, next) {

    var type = mime[req.params.ext] || 'text/plain';
    res.header('Content-Type', type);

    var targetFile = path.join(cache, req.params.name + '.' + req.params.ext),
        readStream;

    if (fs.existsSync(targetFile)) {

        readStream = fs.createReadStream(targetFile);
    } else {

        var file = path.join(dir, req.params.name + '.' + req.params.ext);
        fs.copyFileSync(file, targetFile);

        readStream = fs.createReadStream(file);
    }

    readStream.pipe(res);
    next();
});

server.listen(config.server.port, function () {

    if (!fs.existsSync(cache)) {
        fs.mkdirSync(cache);
    }

    winston.info('%s listening at %s', server.name, server.url);
});
