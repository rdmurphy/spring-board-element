// packages
import { verify } from '@noble/ed25519';

// local
import { Deferred, openLinksInNewTabs, upgradeProperty } from './utils.js';

const encoder = new TextEncoder();
const boardCSS = document.createElement('template');
boardCSS.innerHTML =
	'<style>:host{background-color:var(--board-background-color);box-sizing:border-box;display:block;padding:2rem}time{display:none}h1,h2,h3,h4,h5,p{margin:0 0 2rem}</style>';

class SpringBoardElement extends HTMLElement {
	#loaded = new Deferred<boolean>();

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

	get loaded() {
		return this.#loaded.promise;
	}

	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.appendChild(boardCSS.content.cloneNode(true));
	}

	connectedCallback() {
		/** @ts-ignore */
		this.shadowRoot.addEventListener('click', openLinksInNewTabs);
		upgradeProperty(this, 'href');
	}

	disconnectedCallback() {
		/** @ts-ignore */
		this.shadowRoot.removeEventListener('click', openLinksInNewTabs);
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (name === 'href' && oldValue !== newValue) {
			this.fetch();
		}
	}

	async fetch() {
		if (!this.#loaded.pending) {
			this.#loaded = new Deferred<boolean>();
		}

		const request = new Request(this.href, {
			method: 'GET',
			mode: 'cors',
			headers: {
				'Accept': 'text/html',
				'Spring-Version': '83',
			},
		});

		const response = await fetch(request);
		const signature = response.headers.get('Spring-Signature')!;
		const body = await response.text();
		const verified = await verify(signature, encoder.encode(body), this.key);

		if (verified) {
			const template = document.createElement('template');
			template.innerHTML = body;
			const content = template.content.cloneNode(true);

			this.shadowRoot!.appendChild(content);
			this.#loaded.resolve(true);
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
