var restify = require('restify');
var path = require('path');
var fs = require('fs');

var dir = path.join(__dirname, 'public');

var mime = {
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml'
};

const server = restify.createServer({
    name: 'myapp',
    version: '1.0.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get('/echo/:name', function (req, res, next) {
    res.send(req.params);
    return next();
});

server.get('/image/:name', function (req, res, next) {

    var file = path.join(dir, req.params.name);

    var type = mime[path.extname(file).slice(1)] || 'text/plain';
    res.header('Content-Type', type);

    var readStream = fs.createReadStream(file);
    readStream.pipe(res);

    next();
});

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});
