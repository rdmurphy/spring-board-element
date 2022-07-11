// packages
import { sign } from '@noble/ed25519';
import { createServer } from 'vite';

// local
import { generateBoardHTML, privateKey, publicKey } from './test-constants.js';

const BASE_URL = 'http://localhost';

async function run() {
	const server = await createServer({
		plugins: [
			{
				name: 'vite-micro-spring-server',
				configureServer(server) {
					server.middlewares.use(async (request, response, next) => {
						const url = new URL(request.url, BASE_URL);

						if (url.pathname === '/') {
							response.statusCode = 200;
							response.end('OK');
						} else if (url.pathname === `/${publicKey}`) {
							const boardHTML = generateBoardHTML({
								nested: url.searchParams.has('nested'),
							});
							const signatureBytes = await sign(boardHTML, privateKey);
							const signatureHex = Buffer.from(signatureBytes).toString('hex');
							response.statusCode = 200;
							response.setHeader('Content-Type', 'text/html');
							response.setHeader('Spring-Verson', '83');
							response.setHeader('Spring-Signature', signatureHex);
							response.setHeader(
								'Access-Control-Allow-Methods',
								'GET, OPTIONS',
							);
							response.setHeader('Access-Control-Allow-Origin', '*');
							response.setHeader(
								'Access-Control-Allow-Headers',
								'Content-Type, If-Modified-Since, Spring-Signature, Spring-Version',
							);
							response.setHeader(
								'Access-Control-Expose-Headers',
								'Content-Type, Last-Modified, Spring-Signature, Spring-Version',
							);
							response.end(boardHTML);
						} else {
							next();
						}
					});
				},
			},
		],
	});

	server.listen(7000);
}

run().catch(console.error);
