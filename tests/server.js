// packages
import { sign } from '@noble/ed25519';
import { createServer } from 'vite';

// local
import { generateBoardHTML, privateKey, publicKey } from './test-constants.js';

async function run() {
	const server = await createServer({
		plugins: [
			{
				name: 'vite-micro-spring-server',
				async configureServer(server) {
					const boardHTML = generateBoardHTML();
					const signatureBytes = await sign(boardHTML, privateKey);
					const signatureHex = Buffer.from(signatureBytes).toString('hex');
					server.middlewares.use((request, response, next) => {
						if (request.url === '/') {
							response.statusCode = 200;
							response.end('OK');
						} else if (request.url === `/${publicKey}`) {
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
