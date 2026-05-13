#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(process.cwd(), process.argv[2] || 'dist');
const port = Number(process.argv[3] || process.env.PORT || 8080);
const types = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
	'.mp3': 'audio/mpeg',
	'.ogg': 'audio/ogg',
	'.png': 'image/png',
	'.wav': 'audio/wav'
};

function send(response, status, body, headers = {}) {
	response.writeHead(status, headers);
	response.end(body);
}

const server = http.createServer((request, response) => {
	const url = new URL(request.url, `http://${request.headers.host}`);
	const pathname = decodeURIComponent(url.pathname);
	const requested = path.normalize(path.join(root, pathname));

	if (!requested.startsWith(root)) {
		send(response, 403, 'Forbidden');
		return;
	}

	let filePath = requested;
	if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
		filePath = path.join(filePath, 'index.html');
	}

	fs.readFile(filePath, (error, data) => {
		if (error) {
			send(response, 404, 'Not found');
			return;
		}

		send(response, 200, data, {
			'Content-Type': types[path.extname(filePath)] || 'application/octet-stream'
		});
	});
});

server.listen(port, () => {
	console.log(`Serving ${root} at http://localhost:${port}/`);
	console.log(`Demo: http://localhost:${port}/demo/`);
});
