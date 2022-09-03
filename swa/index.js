// credit: https://adrianmejia.com/building-a-node-js-static-file-server-files-over-http-using-es6/

const { createServer } = require('http');
const { parse: parseUrl } = require('url');
const { existsSync, statSync, readFile } = require('fs');
const { parse: parsePath } = require('path');

const port = 8000;

createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // parse URL
    const parsedUrl = parseUrl(req.url);

    // extract URL path
    let pathname = `.${parsedUrl.pathname}`;

    // based on the URL path, extract the file extension. e.g. .js, .doc, ...
    const ext = parsePath(pathname).ext;

    // maps file extension to MIME typere
    const map = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword'
    };

    const fileExists = existsSync(pathname);
    if (!fileExists) {
        // if the file is not found, return 404
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
        return;
    }

    // if is a directory search for index file matching the extension
    if (statSync(pathname).isDirectory()) pathname += '/index' + ext;

    // read file from file system
    readFile(pathname, function (err, data) {
        if (err) {
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
        } else {
            // if the file is found, set Content-type and send data
            res.setHeader('Content-type', map[ext] || 'text/plain');
            res.end(data);
        }
    });

}).listen(parseInt(port));

console.log(`Server listening on port ${port}`);