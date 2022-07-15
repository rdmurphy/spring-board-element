// packages
import { verify } from '@noble/ed25519';

// local
import { Deferred, openLinksInNewTabs, upgradeProperty } from './utils.js';

// styles
import css from './default-board.css?inline';

const cssTemplate = document.createElement('template');
cssTemplate.innerHTML = `<style>${css}</style>`;

const encoder = new TextEncoder();

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

	get pubdate() {
		const time = this.shadowRoot?.querySelector('time');

		if (time) {
			const datetime = time.getAttribute('datetime');

			if (datetime) {
				return new Date(datetime);
			}
		}

		return null;
	}

	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
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

			const shadowRoot = this.shadowRoot!;
			shadowRoot.textContent = '';
			shadowRoot.append(cssTemplate.content.cloneNode(true), content);

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
