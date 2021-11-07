import fs from 'fs';
import restify from 'restify';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("../package.json");

export class Server {

    constructor(config, winston) {
        this.config = config;
        this.winston = winston;

        // Create restify server
        this.server = restify.createServer({
            name: pkg.name,
            version: pkg.version
        });

        this.server.use(restify.plugins.acceptParser(this.server.acceptable));
        this.server.use(restify.plugins.queryParser());
        this.server.use(restify.plugins.bodyParser());

        // Create cache dir
        if (!fs.existsSync(this.config.images.cache)) {
            fs.mkdirSync(this.config.images.cache);
        }
    }

    run(port, routes) {

        routes.map(({method, path, controller}) => {
            switch (method) {
            case 'get':
                this.server.get(path, controller);
                break;
            case 'post':
                this.server.post(path, controller);
                break;
            default:
                this.winston.info('Missing support for method: %s', method);
            }
        });

        this.server.listen(port, () => {
            this.winston.info('%s listening at %s', this.server.name, this.server.url);
        });

        this.server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                this.winston.error('Address in use...');
            }
        });
    }
}
