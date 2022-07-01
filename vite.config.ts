import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: 'src/spring-board-element.ts',
			formats: ['es', 'umd'],
			name: 'SpringBoardElement',
		},
	},
});
