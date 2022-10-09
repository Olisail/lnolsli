// credit: https://adrianmejia.com/building-a-node-js-static-file-server-files-over-http-using-es6/

import fetch from "node-fetch";
import { createServer } from 'http';
import { parse as parseUrl } from 'url';
import { existsSync, statSync, readFile } from 'fs';
import { parse as parsePath } from 'path';

const port = 8000;
const apiBaseUrl = 'http://localhost:7113';

createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    if (req.url.includes('/api')) {
        console.log(`forwarding request to ${apiBaseUrl}`);
        try {
            req.on('data', async (chunk) => {
                console.log(`[FWD] received data: ${chunk}`);
                const copiedReq = {
                    method: req.method,
                    headers: req.headers,
                    body: chunk
                };

                console.log(`[FWD] sending request to ${apiBaseUrl}`);
                const response = await fetch(String.prototype.concat(apiBaseUrl, req.url), copiedReq);

                console.log(`[FWD] received HTTP ${response.status} response, forwarding`);
                for (const h of response.headers) {
                    res.setHeader(h[0], h[1]);
                }
                res.statusCode = response.status;
                let responseData = null;
                try {
                    const jsonResponse = await response.clone().json();
                    responseData = JSON.stringify(jsonResponse);
                    console.log(`[FWD] response is a JSON: ${responseData}`);
                } catch {
                    try {
                        responseData = await response.text();
                        console.log(`[FWD] response is TEXT: "${JSON.stringify(responseData)}"`);
                    } catch (err) {
                        console.log(`[FWD] response is neither a JSON nor a string: ${err}`);
                    }
                }

                res.end(responseData);
            });
            return;
        } catch (err) {
            const errorMessage = `[FWD] Error while forwarding the query: ${err}.`;
            console.log(errorMessage);
            res.statusCode = 500;
            res.end(errorMessage);
            return;
        }
    }

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