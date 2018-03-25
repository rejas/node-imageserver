// config.js
const path = require('path');

module.exports = {
    server: {
        port: 3000
    },
    images: {
        cache: path.join(__dirname, 'cache'),
        upload: path.join(__dirname, 'public')
    }
};
