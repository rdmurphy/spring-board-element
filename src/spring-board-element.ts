// packages
import { verify } from '@noble/ed25519';

const encoder = new TextEncoder();
const DEFAULT_BOARD_CSS =
	'<style>:host{background-color:var(--board-background-color);box-sizing:border-box;padding:2rem}time{display:none}p,h1,h2,h3,h4,h5{margin:0 0 2rem}</style>';

/**
 * Ensures that all links within a board open in a new tab.
 * @param event
 */
function openLinksInNewTabs(event: MouseEvent) {
	const target = event.target as HTMLElement;

	if (target.matches('a')) {
		target.setAttribute('target', '_blank');
		target.setAttribute('rel', 'noopener');
	}
}

class SpringBoardElement extends HTMLElement {
	static get observedAttributes() {
		return ['href'];
	}

	get href() {
		return this.getAttribute('href') ?? '';
	}

	set href(value: string) {
		this.setAttribute('href', value);
	}

	get key() {
		const href = this.href;

		if (!href) {
			return '';
		}

		// TODO: do more to ensure it's a valid Spring '83 URL
		const url = new URL(href);
		return url.pathname.replace('/', '').toLowerCase().trim();
	}

	connectedCallback() {
		if (!this.shadowRoot) {
			this.attachShadow({ mode: 'open' });
		}

		/** @ts-ignore */
		this.shadowRoot.addEventListener('click', openLinksInNewTabs);
		this.fetch(this.request());
	}

	disconnectedCallback() {
		/** @ts-ignore */
		this.shadowRoot.removeEventListener('click', openLinksInNewTabs);
	}

	attributeChangedCallback(name: string) {
		if (name === 'href') {
			this.fetch(this.request());
		}
	}

	request(): Request {
		const href = this.href;

		if (!href) {
			throw new Error('Missing board href');
		}

		return new Request(href, {
			method: 'GET',
			mode: 'cors',
			headers: {
				'Accept': 'text/html',
				'Spring-Version': '83',
			},
		});
	}

	async fetch(request: RequestInfo) {
		const response = await fetch(request);

		const signature = response.headers.get('Spring-Signature')!;
		const body = await response.text();
		const verified = await verify(signature, encoder.encode(body), this.key);

		if (verified) {
			this.shadowRoot!.innerHTML = DEFAULT_BOARD_CSS + body;
		}
		// TODO: throw an error when invalid? maybe a custom event?
	}
}

declare global {
	interface Window {
		SpringBoardElement: typeof SpringBoardElement;
	}
}

export default SpringBoardElement;

if (!window.customElements.get('spring-board')) {
	window.SpringBoardElement = SpringBoardElement;
	window.customElements.define('spring-board', SpringBoardElement);
}
