// config.js
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    server: {
        port: 3000
    },
    images: {
        cache: path.join(__dirname, 'cache'),
        upload: path.join(__dirname, 'public')
    }
};
